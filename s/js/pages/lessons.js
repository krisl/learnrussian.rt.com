﻿'use strict';

/************************************************************************************
***********************************   Lessons   *************************************
************************************************************************************/
var parse_task_class = new Array("typsecond", "typsixteen", "seventeen", "typseven", "typnine", "typfour", "typtwenty");

var LessonsCustomControl = (function LessonsCustomControl_constructor(){
	var LessonTypes=[], LessonInterfaces={}, LessonsContent={};

	function trim(str, chars) { 
		return ltrim(rtrim(str, chars), chars); 
	} 
	 
	function ltrim(str, chars) { 
		chars = chars || "\\s"; 
		return str.replace(new RegExp("^[" + chars + "]+", "g"), ""); 
	} 
	 
	function rtrim(str, chars) { 
		chars = chars || "\\s"; 
		return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
	}

	function check_class(classes)
	{
		var class_arr = classes.split(' ');
		for(var i = 0; i<class_arr.length; i++)
    		for(var j=0; j<parse_task_class.length; j++){
    			if(class_arr[i].replace(/[ \s+]/g, '') == parse_task_class[j])
    			return true;	
    	}
    	return false;
	}
	//Get task class child elementh
	function get_task_class(obj)
	{
		var arr = obj.parents('.task').attr("class").split(' ');
		return arr;
	}
	//In array function
	function in_array(needle, haystack) {
	    var length = haystack.length;
	    for(var i = 0; i < length; i++) {
	        if(trim(haystack[i], ' ') == trim(needle, ' ')) return true;
	    }
	    return false;
	}
	//Deleting display:none tags
	function rec_del_none(obj, answer)
	{
		obj.children().each(function(indx){	
    		if($(this).attr("class") != '')
    		{
    			if(($('.' + $(this).attr("class")).css("display") == "none" || $(this).css("display") == "none") && !$(this).hasClass(answer))
    			{
    				$(this).remove();
    			}
    		}
    		rec_del_none($(this));
    	});
	}
	function is_num_or_letter(first_sym)
	{
		if(!((first_sym <= 1103 && first_sym >= 1040) || 
				(first_sym <= 57 && first_sym >= 48) || 
				(first_sym <= 90 && first_sym >= 65) || 
				(first_sym <= 122 && first_sym >= 97)))
			return true;
		else
			return false;
	}
	//String padding creator
	//var right_end is padding-right for drag&drop word
    function string_parse(obj, answer_class, task_class, padding_punct, padding_normal)
    {
    	var punct = new Array(".", "?", "!", ",", ":", ";" ,"(", ")", '-', '—', String.fromCharCode(8230)); //+ многоточие
    	var upper_case = new Array(".", "?", "!", ";", ":" , "=", String.fromCharCode(8230));

    	var task_string = '';
    	var right_end = padding_normal;
    	var left_end = 'lower';
		var no_uppercase = true;

    	var is_correct_class = false;

    	for(var i = 0; i<task_class.length; i++)
    		for(var j=0; j<parse_task_class.length; j++){
    			if(task_class[i] == 'no_uppercase'){
					no_uppercase = false;					
				}
				if(task_class[i] == parse_task_class[j])
    			{
    				is_correct_class = true;
    				break;
    			}
			}
    	if(is_correct_class)
    	{
    		var answer_obj = ''

    		$(obj).find(answer_class).each(function(){
    			if($(this).hasClass('editing'))
    			{
    				answer_obj = $(this);
    				return false;
    			}
    			if(!$(this).hasClass('format'))
    			{
    				answer_obj = $(this);
    			}
    			
    		});
    		//if($(answer_obj).html() == '')  = $(obj).children(answer_class);

	    	$(answer_obj).html($(answer_obj).html().replace(/[ \n\t]/g, '').replace("_obj", '') + "_obj");

	    	rec_del_none(obj, answer_class.replace(/[ \.+]/g, ''));

	    	var task_string = obj.text().replace(/[ \s+]/g, '');
	    	var word = answer_obj.html();

	    	var word_start_pos = task_string.indexOf(word);
	    	var word_end_pos = word_start_pos +  word.length;
			
			var first_sym = task_string.charCodeAt(0)
			var dot = ".";
			if(is_num_or_letter(first_sym))
				 task_string = dot.concat(task_string.slice(1));

			//alert(task_string.charAt(word_start_pos-1) + " " + task_string.charAt(word_end_pos));

	    	if ( in_array(task_string.charAt(word_end_pos), punct))
	    		right_end = padding_punct;
	    	
	    	if ( (in_array(task_string.charAt(word_start_pos-1), upper_case) || 
	    		 (in_array(task_string.charAt(word_start_pos-2), upper_case) && is_num_or_letter(task_string.charCodeAt(word_start_pos-1)))|| 
	    		 word_start_pos == 0) && no_uppercase)
	    		left_end = "upper";

	    	return Array(left_end, right_end);
	    }
	    return 0;
    }
    
	function set_check(task, isRight){
		task = $(task);
		var url = 'http://'+location.host+'/answer/';
		var tid = parseInt($('.homework').attr('id').split('-')[1] || 0) * 100 + parseInt(task.attr('id').split('-')[1]);
		// Reset
		if('undefined' == typeof isRight){
			if($(task).hasClass('correct')) $.post(url, {id_exercise: tid, status: 0}, function(){}, 'json'); // without last 2 arguments fire exeption in Opera (jQuery try to evaluate response as script)
			task.addClass('learning').removeClass('wrong').removeClass('correct');
		}
		// Right
		else if(isRight){
			if(!$(task).hasClass('correct')) $.post(url, {id_exercise: tid, status: 1}, function(){}, 'json');// without last 2 arguments fire exeption in Opera (jQuery try to evaluate response as script)
			task.removeClass('learning').removeClass('wrong').addClass('correct');


			if($(task).find("ol").html() != null) var teg = "ol";
			else teg = "ul";

			$(task).find(teg).children().each(function(){
			//var parse_obj = $(this);

				$(this).children('.if_correct').each(function(){
					$(this).addClass("editing");
					//alert($(this).parents("li").attr("class"));
					if(!$(this).parents("li").hasClass('noifl'))
					{
						var clone_parse_obj = $(this).parents("li").clone();
						
						clone_parse_obj.children(".if_correct").css("display", "inline");
						clone_parse_obj.children(".if_learning").remove();

						var margin_right = 0;
						if($(this).parents('.task').hasClass('typseven')) margin_right = -4;

						var letters = string_parse(clone_parse_obj, ".if_correct", get_task_class($(this).parent()), margin_right, 2);
						var text = $(this).text();
						var sub = text.substr(1, text.length-1);
				
						if(letters[0] == "upper") 
							var first_char = text.charAt(0).toUpperCase();
						else 
							var first_char = text.charAt(0).toLowerCase();

						$(this).text(first_char + sub).css("margin-right", letters[1] + "px");
						if(teg == "ul") $(this).css("margin-left", "3px");
					}
					$(this).removeClass("editing");
				});
			});
		}
		// Wrong
		else{
			if($(task).hasClass('correct')) $.post(url, {id_exercise: tid, status: 0}, function(){}, 'json');// without last 2 arguments fire exeption in Opera (jQuery try to evaluate response as script)
			task.removeClass('learning').addClass('wrong').removeClass('correct');

			//Подсветка не правильных
			if(task.hasClass('typsecond'))
				task.find('._vrt_answer_hash').each(function(){
					var answer = $(this).parent().children('.draggable');
					var hash = $(this).html();
					if(answer.html() != null && hash != null)
					{
						if(hash != trim(answer.html().toLowerCase(), ' '))
							answer.addClass("wrong_answer_red");
					}
				});
			if(task.hasClass('typsix'))
				task.find('.bgal').children("ul").children("li").each(function(){
					var answer = $(this).children('span');
					var hash = $(this).attr("answer_hash");
					if(answer.text() != null && hash != null)
					{
						if(trim(answer.text().toLowerCase(), ' ') != hash)
							answer.addClass("wrong_answer_red");
					}
				});
			if(task.hasClass('typeight'))
				task.find('.sort').each(function(){
					var answer_string = $(this).children('._vrt_answer_hash').text();
					if(answer_string != null)
						$(this).children('ul').children().each(function(){
							var user_answer = $(this).children('.draggable');
							if(user_answer.text() != null)
								if(!(answer_string.toLowerCase().indexOf(user_answer.text().toLowerCase()) + 1))
									user_answer.addClass('wrong_answer_red');
						});
				});

		}
		

		lesson_checker.draw_lesson_info();
	}
	
	function check_answers(task, hash){

		hash = hash.replace(/[\s]+/gm,' ').replace(/(^ )|( $)|"/g,'').replace(/<[^>]*>/g,'');
		//alert(hash);
		hash = md5.hash(hash);
		
		console.log('hash=%s', hash);
		var task_hash = task.attr('hash');
		//alert(task_hash + "\n" + hash);

		if($(task).find('._vrt_test_completed').html() != null)
		{
			var positive_answer = 0;
			var good_answer = 0;
			$(task).find(".chosen").each(function(){
				if($(this).find(".answer").html() != null)
					positive_answer++;
			});
			$(task).find('._vrt_test_completed').children('[class ^= _vrt_test_result_]').each(function(){
				var higher = $(this).children('._vrt_higher').text() || 0;
				var lower = $(this).children('._vrt_lower').text() || 0;

				if(positive_answer >= higher || higher == 0)
					if(positive_answer <= lower || lower == 0)
					{
						good_answer = $(this);
						return false;
					}
			});

			set_check(task, true);

			if(good_answer)
				$(task).find('.ctask').children('tabcontrol').hide(100, function(){
					$(task).find('._vrt_test_completed').show(100);	
					$(good_answer).show(100);
					var url = 'http://'+location.host+'/answer/';
					var answer_id = $(good_answer).attr("class").match(/_vrt_test_result_([0-9+])\s+/i)[1];
					var tid = parseInt($('.homework').attr('id').split('-')[1] || 0) * 100 + parseInt(task.attr('id').split('-')[1]);
					$.post(url, {id_exercise: tid, status: 1, test_result: answer_id}, function(){}, 'json');
				});

			return true;
		}

		if(task_hash == hash){
			set_check(task, true);
		}
		else{
			set_check(task, false);
		}
		return (task_hash == hash);
	}
	
	var lesson_checker = (function(){
		
		function draw_lesson_info(){
			var com = draw_complete_percentage();

			if(com==100){
				$('.lessoncomplected:hidden').show();
			}else{
				$('.lessoncomplected:visible').hide();
			}
		}
		
		function draw_complete_percentage(){
			var com=Math.round(100 * $('.task.correct:not(.nocheck)').length / $('.task:not(.nocheck)').length);
			$('.rlesson .completed').html(com+'% completed');
			return com;
		}
		
		function init(){
			draw_complete_percentage();
			$('.lessoncomplected.popup .close').click(function close(){
				$('.lessoncomplected.popup:visible').hide();
			});
		}
		
		return {
			init: init,
			draw_lesson_info: draw_lesson_info
		};
	})();

	var DragDropType=(function DragDropType_constructor(){
		var tasks=[];
		
		//*** DOM ***
		function change_parent_for_draggable(moving_element, new_parent){
			var old_parent = moving_element.parentNode;
			if($(old_parent).css('position') == 'static'){
				$(old_parent).css('position', 'relative');
			}
			
			//*** Updating info ***
			var moel = $(moving_element);
			var olpa = $(old_parent);
			var nepa = $(new_parent);
			if(!olpa.hasClass('droppable')) olpa = olpa.parents('.droppable');
			if(!nepa.hasClass('droppable')) nepa = nepa.parents('.droppable');
			this.init_draggable(moel);
			this.init_droppable(olpa);
			this.init_droppable(nepa);
			nepa.data('draggable_elements').push(moel[0]);
			for(var i=0; i<olpa.data('draggable_elements').length; i++){
				if(olpa.data('draggable_elements')[i] == moel[0]){
					olpa.data('draggable_elements').splice(i,1);
				}
			}
			this.droppable_redraw(olpa);
			this.droppable_redraw(nepa);
		
		
			//*** Changing position ***
			var old_parent_offset = $(old_parent).offset();
			var new_parent_offset = $(new_parent).offset();
			var old_element_offset = $(moving_element).offset();
			old_element_offset = {top: old_element_offset.top, left: old_element_offset.left};
			
			var old_top = parseInt($(moving_element).css('top'));
			var old_left = parseInt($(moving_element).css('left'));
			
			var new_top = old_top + old_parent_offset.top - new_parent_offset.top;
			var new_left = old_top + old_parent_offset.left - new_parent_offset.left;
			
			if($(moving_element).hasClass('wrong_answer_red'))
					$(moving_element).removeClass("wrong_answer_red");

			$(moving_element).css({
				top: new_top+'px',
				left: new_left+'px'
			});
			if($(moving_element).hasClass("format"))
			{
				$(moving_element).removeClass("format");
				$(moving_element).css("margin-right", "0px");
			}
			
			this.append_to_other_parent(moving_element, new_parent);
			if($(moving_element.parentNode).css('position') == 'static'){
				$(moving_element.parentNode).css('position', 'relative');
			}
			
			var new_element_offset = $(moving_element).offset();
			
			new_top += old_element_offset.top - new_element_offset.top;
			new_left += old_element_offset.left - new_element_offset.left;
			
			$(moving_element).css({
				top: new_top+'px',
				left: new_left+'px'
			});
			
			//*** Changing draggable params ***
			if(moel.data('draggable').offset){ // if moving_element was dragged
				moel.data('draggable').offset.parent.top = moel.parent().offset().top;
				moel.data('draggable').offset.parent.left = moel.parent().offset().left;
			}
		}
		function append_to_other_parent(moving_element, new_parent){
			$(moving_element).prependTo(new_parent);
		}
		
		//*** Info ***
		function init_draggable(draggable_element){
			draggable_element = $(draggable_element);
			var droppable_element = draggable_element.parents('.droppable');
			if(!droppable_element.hasClass('droppable')) throw new Error('Draggable parent is not droppable');
			if(!draggable_element.data('default_parent')){
				draggable_element.data('default_parent', droppable_element[0]);
			}
		}
		function init_droppable(droppable_element){
			droppable_element = $(droppable_element);
			if(!droppable_element.data('draggable_elements')){
				droppable_element.data('draggable_elements', []);
			}
		}
		
		//*** Dragging ***
		function drag_start(ev, ui){
			var draggable = ui.helper[0];
			var droppable = $(draggable).parents('.droppable')[0];
			if(($(draggable).data('default_parent')) && ($(draggable).data('default_parent') !== droppable)){
				$(draggable).parent().find('.if_empty').show();

				
				var drag = $(draggable).parent().find('.draggable');
				if(!drag.hasClass("uppercase"))
				{
					var str = drag.html();
					var sub = str.substr(1, str.length-1);
					var first_char = str.charAt(0).toLowerCase();
					drag.html(first_char + sub);
				}

				this.change_parent_for_draggable(draggable, $(draggable).data('default_parent'));

			}

		}
		function drag_drag(ev, ui){
		
		}
		function drag_stop(ev, ui){
			this.revert_draggable(ev.target);
		}
		function revert_draggable(draggable){
			$(draggable).animate({
				top: '0px',
				left: '0px'
			});

		}
		
		//*** Dropping ***
		function drop_over(ev, ui){
			$(ev.target).addClass('overed');
		}
		function drop_drop(ev, ui){
			var draggable = ui.draggable;
			var droppable = $(ev.target);

			var uppercase = $(draggable).hasClass('uppercase');

			// Check input conditions
			if(draggable.parents('.task')[0] !== droppable.parents('.task')[0]) return;

			// Do actions
			if(droppable[0] !== draggable.data('default_parent')){
				this.change_parent_for_draggable(draggable[0], droppable[0]);
			}
			
			$(ev.target).removeClass('overed');
			$(ev.target).children('.if_empty').css("display" , "none");

			if(check_class($(ev.target).parents('.task').attr('class')))
			{
				var text = $(ev.target).find('.draggable').html();
				var letters = string_parse($(ev.target).parent().clone(), ".draggable", get_task_class($(ev.target)), -4, 0);
				var sub = text.substr(1, text.length-1);

				if(!uppercase)
				{
					if(letters[0] == "upper") 
						var first_char = text.charAt(0).toUpperCase();
					else 
						var first_char = text.charAt(0).toLowerCase();
					$(ev.target).children(".draggable").text(first_char + sub).css("margin-right", letters[1] + "px");
				}
				else
				{
					$(ev.target).children(".draggable").text(text).css("margin-right", letters[1] + "px").addClass("uppercase");
				}
				$(ev.target).children(".draggable").addClass('format');
			}
			//*** Checking answers ***
			var checker = droppable.parents('.task').data('check_answers');
			checker && checker();

		}
		function drop_out(ev, ui){
			$(ev.target).removeClass('overed');
		}
		function droppable_redraw(droppable){
			if(droppable.data('draggable_elements').length){
				droppable.addClass('full').removeClass('empty');
				if(!droppable.hasClass('multidrop')) droppable.droppable({disabled: true});
			}else{

				droppable.removeClass('full').addClass('empty');
				if(!droppable.hasClass('multidrop')) droppable.droppable({disabled: false});
			}

		}
		
		//*** Actions ***
		function resetTask(task){
			var type_overrider = this;
			$('.draggable', task).each(function(n, draggable){
				var droppable = draggable.parentNode;
				if(($(draggable).data('default_parent')) && ($(draggable).data('default_parent') !== droppable)){
					type_overrider.change_parent_for_draggable(draggable, $(draggable).data('default_parent'));
					type_overrider.revert_draggable(draggable);
				}
			});
			task.find('.if_empty').each(function(){
				$(this).show();
			});
		}
		
		function initType(selector){
			function DragndropOverrider(){
				this.constructor = DragndropOverrider;
			}
			DragndropOverrider.prototype={
				drag_start: drag_start,
				drag_drag: drag_drag,
				drag_stop: drag_stop,
				drop_over: drop_over,
				drop_drop: drop_drop,
				drop_out: drop_out,
				change_parent_for_draggable: change_parent_for_draggable,
				append_to_other_parent: append_to_other_parent,
				init_draggable: init_draggable,
				init_droppable: init_droppable,
				revert_draggable: revert_draggable,
				droppable_redraw: droppable_redraw,
				resetTask: resetTask
			};
			var overrider = new DragndropOverrider();
			
			$(selector+' .draggable').draggable({
				start: drag_start.bind(overrider),
				drag: drag_drag.bind(overrider),
				stop: drag_stop.bind(overrider)//,
				//containment: '.task',
				//scroll: false
				//revert: true
			});
			
			$(selector+' .droppable').droppable({
				over: drop_over.bind(overrider),
				drop: drop_drop.bind(overrider),
				out: drop_out.bind(overrider),
				tolerance: 'pointer'
			});
			
			return overrider;
		}
		
		return {
			initType: initType
		}
	})();
	
	LessonInterfaces.DragAndDrop1 = (function(typeClass){ // 1, 2
		typeClass = '.'+typeClass;
		var lesson, dragndrop;
		
		function reset(ev){
			var task = $(ev.target).parents('.task');
			set_check(task);
			$('.draggable',task)
				.draggable({disabled: false})
				.data('default_parent', $('.droppable_default', task)[0]);
			dragndrop.resetTask(task);
		}
		
		function check_task(task){
			var answered = $('.ctask .droppable.full',task);
			if($('.ctask .droppable',task).length == answered.length){
				var hash="";
				for(var i=0; i<answered.length; i++){
					var item_answer = ''
					$(answered[i]).children().each(function(){
						if(!$(this).hasClass('_vrt_answer_hash'))
						{
							if(!$(this).hasClass('uppercase'))
								item_answer += trim($(this).text().toLowerCase(),' ') + ' ';	
							else
								item_answer += trim($(this).text(),' ') + ' ';
						}
					});
					hash+=item_answer +' |';
					//hash+=answered[i].innerHTML+'|';
				}
				var isCorrect = check_answers($(task), hash);
				if(isCorrect){
					$('.draggable',task).draggable({disabled: true});
				}
			}
		}
		
		function init(){
			dragndrop = DragDropType.initType(typeClass);
			
			$('.task'+typeClass).each(function(n, task){
				$(task).data('check_answers', function(){
					check_task(task);
				});
				if($(task).hasClass('correct')){
					$('.draggable',task).draggable({disabled: true});
				}
			});
			
			$(typeClass+' .butreset').click(reset);
		}
		
		return lesson = {
			init: init,
            check_task: check_task,
            reset: reset
		};
	});
    LessonInterfaces.DragAndDrop2 = (function(typeClass){ // 10
        typeClass = '.'+typeClass;
        var lesson;
        var empty='__________________________________________________________';

        function transform_for_pasting(str){
            return str.replace(/<br[ ]*[\/]*>/,' ');
        }
        function revert_drag_handler(e){
            if(e.button!=0) return;
            var task = $(e.target).parents('.task');
            var h, p=$(e.target);
            if(!p.hasClass('droppable')){
                p=p.parents('span.droppable');
            }
            p.unbind('mousedown',revert_drag_handler);
            $('.r-star-shape:hidden',task).each(function(n,el){
                if(p.html()==transform_for_pasting($(el).find('p').first().html())){
                    h=$(el).show();
                }
            });
            p.droppable({disabled:false})
                .html(empty)
                .removeClass('answered');
            h.css({
                top:(parseInt(h.css('top'))+p.offset().top-h.offset().top+(p.height()-h.height())/2)+'px',
                left:(parseInt(h.css('left'))+p.offset().left-h.offset().left)+'px'
            });
            var answers = $('li', task);
            for (var i = answers.length - 1; i > 1; i--) {
                if ($('span', answers[i - 1]).hasClass('answered') || $('span', answers[i]).hasClass('answered')) {
                    break;
                } else {
                    $(answers[i]).hide();
                }
            }
            var value_span = $($(e.target).parents('li').find('span')[1]);
            value_span.empty();
            var data = h.data();
            data.draggable._mouseDown(e);
            set_check(task);
        }
        function check_task(task){
            var answers = $('li', task);
            if($('.r-star-shape:visible',task).length == 0){
                var hash="";
                for (var i = 1; i < answers.length; i++) {
                    hash += $($(answers[i]).find('span')[1]).html() + '|';
                }
                check_answers(task, hash);
            } else {
                for (var j = 2; j < answers.length; j++) {
                    if ($('span', answers[j - 1]).hasClass('answered')) $(answers[j]).show();
                }
            }
        }
        function drop_drop(ev, info){
            var text = transform_for_pasting(info.draggable.find('p').first().html());
            $(ev.target)
                .droppable({disabled:true})
                .html(text)
                .addClass('answered')
                .bind('mousedown',revert_drag_handler);
            info.draggable.hide();
            drop_out(ev, info);

            var value_span = $($(ev.target).parents('li').find('span')[1]);
            value_span.html(info.draggable.attr('id'));

            check_task($(ev.target).parents('.task'))
        }
        function drop_over(ev, info){
            $(ev.target).addClass('overed');
        }
        function drop_out(ev, info){
            $(ev.target).removeClass('overed');
        }
        function reset(ev){
            var task = $(ev.target).parents('.task');
            $('.droppable',task)
                .droppable({disabled:false})
                .html(empty)
                .removeClass('answered');
            $('.r-star-shape',task).show();
            var answers = $('li', task);
            for (var i = 1; i < answers.length; i++) {
                if (i > 1) $(answers[i]).hide();
                $($(answers[i]).find('span')[1]).empty();
            }
            set_check(task);
        }
        var drag_diff;
        function drag_drag(ev, info){
            var mouseX = ev.pageX || (ev.clientX + (document.documentElement && document.documentElement.scrollLeft || document.body && document.body.scrollLeft));
            var mouseY = ev.pageY || (ev.clientY + (document.documentElement && document.documentElement.scrollTop || document.body && document.body.scrollTop));
            var width = info.helper.width();
            var height = info.helper.height();
            var css_left = parseInt(info.helper.css('left'));
            var top = info.helper.offset().top;
            var left = info.helper.offset().left;
            drag_diff = drag_diff || {
                top: (top-mouseY)+height/5,
                left: (left-mouseX)+width/10

            };
        }
        function drag_stop(ev, info){
            drag_diff=undefined;
            $(ev.target).animate({
                top: '0px',
                left: '0px'
            });
        }
        function init(){
            $(typeClass+' .r-star-shape').draggable({
                drag: drag_drag,
                stop: drag_stop,
                revert: false
            });
            $(typeClass+' .droppable').droppable({
                drop: drop_drop,
                over: drop_over,
                out: drop_out
            });
            $(typeClass+' .droppable_disabled').each(function(n,el){
                $(el).html(transform_for_pasting($(el).html()));
            });
            $(typeClass+' .droppable_disabled')
                .droppable({disabled:true})
                .addClass('answered')
                .removeClass('droppable_disabled')
                .bind('mousedown',revert_drag_handler);
            $(typeClass+' .butreset').click(reset);

        }

        return lesson = {
            init: init,
            check_task: check_task,
            reset: reset
        };
    });
    LessonInterfaces.DragAndDropTab = (function(typeClass){ // 17
		var lesson;
		var empty='...........';
		typeClass='.'+typeClass;
		
		function transform_for_pasting(str){
			str = str.replace(/<br[ ]*[\/]*>/,' ');
			return str;
		}
		function revert_drag_handler(e){
			if(e.button!=0) return;
			var task = $(e.target).parents('.task');
			var h, p=$(e.target);
			if(!p.hasClass('droppable')){
				p=p.parents('span.droppable');
			}
			if(!p.hasClass("uppercase"))
			{
				var str = p.html();
				var sub = str.substr(1, str.length-1);
				var first_char = str.charAt(0).toLowerCase();
				p.html(first_char + sub);
			}
			p.unbind('mousedown',revert_drag_handler);
			$('.limit:hidden',task).each(function(n,el){
				if(p.html()==transform_for_pasting(el.innerHTML)){
					h=$(el).show();
				}
			});
			p.droppable({disabled:false})
				.html(empty)
				.removeClass('answered');
			h.css({
				top:(parseInt(h.css('top'))+p.offset().top-h.offset().top+(p.height()-h.height())/2)+'px',
				left:(parseInt(h.css('left'))+p.offset().left-h.offset().left)+'px'
			});
			var data = h.data();
			data.draggable._mouseDown(e);
			set_check(task);
		}
        function check_task(task){
            var answered = $('.droppable.answered',task);
            if($('.droppable',task).length == answered.length){
                var hash="";
                for(var i=0; i<answered.length; i++){
                    hash+=answered[i].innerHTML+'|';
                }
                check_answers(task, hash);
            }
        }

		function drop_drop(ev, info){

			var task = $(ev.target).parents('.task');
			var tabcontrol = $(ev.target).parents('tabcontrol');
			var text = transform_for_pasting(info.draggable.html());
			var uppercase = info.draggable.hasClass("uppercase");

			$(ev.target)
				.droppable({disabled:true})
				.html(text)
				.addClass('answered')
				.bind('mousedown',revert_drag_handler);

			info.draggable.hide();
			drop_out(ev, info);			

			var letters = string_parse($(ev.target).parent().clone(), ".answered", get_task_class($(ev.target)), 1, 3);
			var sub = text.substr(1, text.length-1);

			if(!uppercase)
			{
				if(letters[0] == "upper") var first_char = text.charAt(0).toUpperCase();
				else var first_char = text.charAt(0).toLowerCase();
				$(ev.target).text(first_char + sub).css("padding-right", letters[1] + "px");
			}
			else
			{
				$(ev.target).text(text).css("padding-right", letters[1] + "px").addClass("uppercase");
			}

			if(0 === $('.tab-'+tabcontrol[0].activeTab() + ' .droppable:not(.answered)',tabcontrol[0]).length){
				tabcontrol[0].nextTab();
			}
			check_task(task);
		}
		function drop_over(ev, info){
			$(ev.target).addClass('overed');
		}
		function drop_out(ev, info){
			$(ev.target).removeClass('overed');
		}
		function reset(ev){
			var task = $(ev.target).parents('.task');
			$('.droppable',task)
				.droppable({disabled:false})
				.html(empty)
				.removeClass('answered');
			$(typeClass+' .limit').show();
			set_check(task);
		}
		var drag_diff;
		function drag_drag(ev, info){
			var mouseX = ev.pageX || (ev.clientX + (document.documentElement && document.documentElement.scrollLeft || document.body && document.body.scrollLeft));
			var mouseY = ev.pageY || (ev.clientY + (document.documentElement && document.documentElement.scrollTop || document.body && document.body.scrollTop));
			var width = info.helper.width();
			var height = info.helper.height();
			var css_left = parseInt(info.helper.css('left'));
			var top = info.helper.offset().top;
			var left = info.helper.offset().left;
			drag_diff = drag_diff || {
				top: (top-mouseY)+height/5,
				left: (left-mouseX)+width/10
			};
		}
		function drag_stop(ev, info){
			drag_diff=undefined;
			$(ev.target).animate({
				top: '0px',
				left: '0px'
			});
		}
		function init(){
			$(typeClass+' .limit').draggable({
				drag: drag_drag,
				stop: drag_stop,
				revert: false
			});
			$(typeClass+' .limit')
				.mouseup(drag_stop);
			$(typeClass+' .droppable').droppable({
				drop: drop_drop,
				over: drop_over,
				out: drop_out,
				tolerance: 'pointer'
			});
			$(typeClass+' .droppable_disabled').each(function(n,el){
				$(el).html(transform_for_pasting($(el).html()));
			});
			$(typeClass+' .droppable_disabled')
				.droppable({disabled:true})
				.addClass('answered')
				.removeClass('droppable_disabled')
				.bind('mousedown',revert_drag_handler);
			$(typeClass+' .butreset').click(reset);
		}
		
		return lesson = {
			init: init,
            check_task: check_task,
            reset: reset
		};
	});
    LessonInterfaces.DragAndDropSprite = (function(typeClass){ //
        typeClass = '.'+typeClass;
        var frame_size = 115, series_size = 1, series_num = 0, frame_limit = 5;
        var lesson;

		var frame_num = {
			'girls': 2,
			'boys': 2
		};
		var frame_pos = {
			'girls': [0, -95, -205, -310, -415, -525],
			'boys': [-1340, -1070, -805, -545, -280, 0]
		};
		
        function reset(ev){}

        function check_task(task){}

        function drag_stop(ev){
            $(ev.target).css({
                top: 0,
                left: 0
            });
        }

        function drop_drop(ev, ui){
            var droppable = $(ev.target);
			var draggable = ui.draggable;
			var cl_name = droppable.hasClass('boys') ? 'boys' : 'girls';
			
			if(draggable.parents('.task')[0] !== droppable.parents('.task')[0]) return;
            
			//var shift = parseInt(droppable.css('background-position').split(' ')[0]);
            if(ui.draggable.hasClass('more')){
                //shift += frame_size;
				if(frame_num[cl_name]) frame_num[cl_name]--;
            }else if(ui.draggable.hasClass('less')){
                //shift -= frame_size;
				 if(frame_num[cl_name] < frame_limit) frame_num[cl_name]++;
            }else{
                console.warn('Unexpected draggable element');
                return;
            }
            // if(shift<(-frame_limit*frame_size)) shift = -frame_limit*frame_size;
            // if(shift>0) shift = 0;
            // droppable.css('background-position', shift+'px 0px');
			
			console.log('frame_num: ' + frame_num[cl_name] + '; frame_pos: ' + frame_pos[cl_name][frame_num[cl_name]]);
			droppable.css('background-position', frame_pos[cl_name][frame_num[cl_name]]+'px 0px');


            series_num++;
            if(series_num >= series_size){
                series_num = 0;
            }else{
                setTimeout(function(){
                    drop_drop(ev, ui);
                },100);
            }
        }

        function init(){
            $(typeClass+' .draggable').draggable({
                stop: drag_stop
            });

            $(typeClass+' .droppable').droppable({
                //over: drop_drop,
                //out: drop_drop,
                drop: drop_drop
            });
        }

        return lesson = {
            init: init,
            check_task: check_task,
            reset: reset
        };
    });
    LessonInterfaces.TabQuiz1 = (function(typeClass){ // 3
        typeClass = '.'+typeClass;
        var lesson;

        //*** Reset and checking
        function reset(e){
            var task = $(e.target).parents('.task');
            var tabcontrol = $('tabcontrol',task);
            $('.bordersmall.chosen',tabcontrol).removeClass('chosen');
            set_check(task);
            if($(task).find('._vrt_test_completed').html() != null)
            {
				$(task).find('._vrt_test_completed').hide(100, function(){
					$(task).find('._vrt_test_completed').children().each(function(){
						$(this).hide();
					});
					$(task).find('.ctask').children('tabcontrol').show(100);
				});
            }
            tabcontrol[0].setTab(1);
        }
        function check_task(task){
            var hash='';
            var tab_count = $('tabcontrol>ul:first>li',task).length || 1;
            var isFullAdd, tab_answered_count=0;
            for(var i=1; i<=tab_count; i++){
                isFullAdd = 0;
                $('tabcontrol .tab-'+i+' .bordersmall.chosen p',task).each(function(n, el){
                    hash += $(el).html()+'|';
                    isFullAdd = 1;
                });
                tab_answered_count += isFullAdd;
            }
            var isFull = (tab_count==tab_answered_count);
            if(isFull) check_answers(task, hash);
        }

        //*** Events handling ***
        function bordersmall_click_handler(e){
            var task = $(e.target).parents('.task');
            if(task.hasClass('correct')) return;
            var target = $('p',e.target)[0] || e.target;
            var tabcontrol = $(target).parents('tabcontrol');
            var numb = tabcontrol[0].activeTab() || 1;
            var multichose = $(target).parents('.bordersmall').hasClass('stopnext');

            set_check(task);
            if(multichose){
                $(target).parents('.bordersmall').toggleClass('chosen');
            }else{
                $('.tab-'+numb+' .bordersmall.chosen',tabcontrol).removeClass('chosen');
                $(target).parents('.bordersmall').addClass('chosen');
            }

            check_task(task);

            if(!multichose) setTimeout(function(){
                tabcontrol[0].nextTab();
            },400);
        }
		function bordersmall_mouseover_handler(e){
            var target = $($('p',e.target)[0] || e.target).parents('.bordersmall');
			if(!target.hasClass('chosen')){
				target.addClass('hover');
			}
		}
		function bordersmall_mouseout_handler(e){
            var target = $($('p',e.target)[0] || e.target).parents('.bordersmall');
			target.removeClass('hover');
		}

        function init(){
            // Bind events
            $(typeClass+' .bordersmall')
				.click(bordersmall_click_handler)
				.mouseover(bordersmall_mouseover_handler)
				.mouseout(bordersmall_mouseout_handler);
            $(typeClass+' .butreset').click(reset);
        }

        return lesson = {
            init: init,
            check_task: check_task,
            reset: reset
        };
    });
    LessonInterfaces.TabQuiz2 = (function(typeClass){ // 12
        typeClass = '.'+typeClass;
        var lesson;
        var empty = '___';

        //*** Reset and answers ***
        function reset(e){
            var task = $(e.target).parents('.task');
            set_check(task);
            $('.answerable',task).html(empty).removeClass('answered');
            $('.chosen',task).removeClass('chosen');
            $('tabcontrol',task)[0].setTab(1);
        }
        function check_task(task){
            var hash='', isFull=true;
            $('.answerable',task).each(function(n, el){
                isFull = isFull && $(el).hasClass('answered');
                hash += el.innerHTML + '|';
            });
            if(isFull) check_answers(task, hash);
        }
        function draw_answer(target){
            var tabcontrol = $(target).parents('tabcontrol');
            var numb = tabcontrol[0].activeTab();
            $('.question.tab-'+numb+' .answerable',tabcontrol).html(target.innerHTML).addClass('answered');
            $('.gg .limit.tab-'+numb+'',tabcontrol).removeClass('chosen');
            $(target).addClass('chosen');
        }
        function limit_mousedown_handler(e){
            var task = $(e.target).parents('.task');
            if(task.hasClass('correct')) return;
            var tabcontrol = $(e.target).parents('tabcontrol');
            var anch = task.attr('id');
            var numb = parseInt(/tab-([0-9])+/.exec($(e.target)[0].className)[1]);

            set_check(task);
            draw_answer(e.target);
            check_task(task);

            setTimeout(function(){
                tabcontrol[0].nextTab();
            },400);
        }

        function init(){
            // Binding events
            $(typeClass+' .gg .limit').mousedown(limit_mousedown_handler);
            $(typeClass+' .butreset').click(reset);
        }

        return lesson = {
            init: init,
            check_task: check_task,
            reset: reset
        };
    });
    LessonInterfaces.ListQuiz1 = (function(typeClass){ // 20
        typeClass = '.'+typeClass;
        var lesson;
        var empty = '...';

        //*** Reset and answers ***
        function reset(e){
            var task = $(e.target).parents('.task');
            set_check(task);
            $('.answerable',task).html(empty).removeClass('answered red');
            $('.chosen:not(.example)',task).removeClass('chosen');
        }
        function check_task(task){
            var hash='', isFull=($('.ctask ul',task).length == $('.chosen',task).length);
            $('.chosen',task).each(function(n, el){
                hash += $(el).text() + '|';
                if($(el).parent().find('.answered').html() != null)
                {
	                var letters = string_parse($(el).parent().clone().remove('.bordersmall'), ".answered", get_task_class($(el)), 0, 1);
					var text = $(el).parent().find('.answered').html();//.replace(/\s+/, '');
					text = trim(text, " ");
					var sub = text.substr(1, text.length-1);
					if(letters[0] == "upper") 
						var first_char = text.charAt(0).toUpperCase();
					else 
						var first_char = text.charAt(0).toLowerCase();
					$(el).parent().find('.answered').text(first_char + sub).css("margin-right", letters[1] + "px");
				}
            });
            if(isFull) check_answers(task, hash);
        }
        function draw_answer(target){
            var answer = $(target).text().replace(/\s+/, '');
            $(target).parent().find('.answerable').html(answer).addClass('answered');
            $(target).parent().children('.bordersmall.chosen').removeClass('chosen');
            $(target).addClass('chosen');
        }
        function limit_mousedown_handler(e){
            var task = $(e.target).parents('.task');
            if(task.hasClass('correct')) return;

            set_check(task);

            var target = $(e.target).parents('.bordersmall')[0] || e.target;
            draw_answer(target);

            check_task(task);
        }
        function limit_mouseover_handler(e){
            var target = $(e.target).parents('.bordersmall')[0] || e.target;
            if(!$(target).hasClass('chosen')){
                $(target).addClass('hover');
            }
        }
        function limit_mouseout_handler(e){
            var target = $(e.target).parents('.bordersmall')[0] || e.target;
            $(target).removeClass('hover');
        }

        function init(){
            // Binding events
            $(typeClass+' .bordersmall').mousedown(limit_mousedown_handler);
            $(typeClass+' .bordersmall').mouseover(limit_mouseover_handler);
            $(typeClass+' .bordersmall').mouseout(limit_mouseout_handler);
            $(typeClass+' .butreset').click(reset);
        }

        return lesson = {
            init: init,
            check_task: check_task,
            reset: reset
        };
    });
    LessonInterfaces.Listening = (function(typeClass){ // 5
		typeClass = '.'+typeClass;
		var lesson;
		
		function reset(e){
			var task = $(e.target).parents('.task');
			set_check(task);
			$('.players.answered',task).removeClass('answered');
			$('.playerstwo.answered',task).removeClass('answered');
		}
        function check_task(task){
            if((0 === $('.players:not(.answered)',task).length) && (0 === $('.playerstwo:not(.answered)',task).length)){
                set_check(task, true);
            }
        }
		function playtwo_click_handler(e){
			var task = $(e.target).parents('.task');
			$(e.target).parents('.players').addClass('answered');
			$(e.target).parents('.playerstwo').addClass('answered');
			//check_task(task);
		}
		
		function init(){
			$(typeClass+' .plpau').click(playtwo_click_handler);
			$(typeClass+' .butreset').click(reset);

            $(typeClass).each(function(n,task){
                task = $(task);
                if(!task.hasClass('nocheck')){
                    task.addClass('nocheck');
                    $('.ltask>.check',task).remove();
                    $('.ltask>.butreset',task).remove();
                }
            });
		}
		
		return lesson = {
			init: init,
            check_task: check_task,
            reset: reset
		};
    });
	LessonInterfaces.Gallery = (function(typeClass){ // 6
		typeClass = '.'+typeClass;
		var lesson;
		var can_drop = true;
		
		//*** Reset and answers ***
		function reset(e){
			var task = $(e.target).parents('.task');
			set_check(task);
			$('.gallery ul>li>span',task).each(function(n,el){
				var li=document.createElement('li');
				$(el)
					.unbind('mousedown',revert_answer)
					.draggable({disabled:false})
					.appendTo(li)
					.removeClass('wrong_answer_red');

				$(li).appendTo($('.words',task));
				$(el).css("position", "relative");
			});
			$('.gallery ul>li',task).removeClass('answered');
		}
		function check_task(task){
			if($('.gallery ul>li',task).length != $('.gallery ul>li.answered',task).length) return;
			var arr=[];
			$('.answered',task).each(function(n, el){
				arr[$(el).data('img_number')] = $('span', el).html();
			});
			var hash = arr.join('|')+'|';
			check_answers(task, hash);
		}

		/*function click_gallery(value, count)
		{
			jQuery(".rtengal a").trigger("mousedown",function(){
				if(count!=value)
				{
					click_gallery(value, ++count);
				}	
			});	
		}*/
		//*** Drag and drop ***
		function bgallery_drop_handler(e, ui){
			var task = $(e.target).parents('.task');
			var x = e.pageX - $('.gallery ul',task).offset().left - 20;
			var n = Math.floor(x/325);
			var container = $('.gallery ul>li:eq('+n+')',task);

			if(!container.hasClass('answered') && can_drop){
				var li = ui.helper.parent();
				ui.helper.appendTo(container);
				li.remove();
				container.addClass('answered');
				$(ui.helper).draggable({disabled:true}).mousedown(revert_answer);
				check_task(task);

				var check = 0;				
				var delay = 1;
				var answerd = 0;

				container.parent().children().each(function(){
					check++;
					if($(this).children("span").html() != null)
					{
						answerd++;
						$(this).children("span").css("position", "absolute");
					}
				});
				container.nextAll().each(function(indx){
					if($(this).attr("class") == 'answered'){ delay++; }
					else return false;
				});

				if(delay==check || delay > check || check == answerd) delay=0;

				var gal_id = container.parents('.gallery').attr("id");

				setTimeout(function(){
				    var count = 0;				    
					can_drop = false;
					var interval_gallery = setInterval(function(){
			    		if(count == delay){ 
							can_drop = true; 
							clearInterval(interval_gallery);
						}
			    		else
			    		{
			    			jQuery("#" + gal_id + " .rtengal a").trigger("mouseup");
			    			count++;
			    		}
			    	}, 500);
                }, 400);
			}
		}
		function revert_answer(e){
			if(e.button!=0) return;
			var task = $(e.target).parents('.task');
			if(task.hasClass('correct')) return;
			var target = $(e.target);
			set_check(task);
			target.parent().removeClass('answered');
			target.draggable({disabled:false}).unbind('mousedown',revert_answer);
			
			var li=document.createElement('li');
			target.appendTo(li);
			$(li).appendTo($('.words',task));
			target.css("position", "relative");
			target.removeClass("wrong_answer_red");
		}
		
		function init(){
			$(typeClass+' .butreset').click(reset);
			$(typeClass+' .bgallery').droppable({
				drop: bgallery_drop_handler
			});
			$(typeClass+' .words li span').draggable({
				revert: true
			});
			$(typeClass+' .gallery span').draggable({
				revert: true
			});
			$(typeClass+' .gallery span').draggable({disabled:true}).mousedown(revert_answer);
		}
		
		return lesson = {
			init: init,
            check_task: check_task,
            reset: reset
		};
    });
	LessonInterfaces.Categories = (function(typeClass){ // 8
		typeClass = '.'+typeClass;
		var lesson, dragndrop;
		
		function reset(ev){
			var task = $(ev.target).parents('.task');
			set_check(task);
			$('.draggable',task)
				.draggable({disabled: false})
				.data('default_parent', $('.droppable_default', task)[0]);
			dragndrop.resetTask(task);
		}
		
		function check_task(task){
			if($('.words .draggable',task).length !== 0) return;
			
			var hash="";
			var drops = $('.sort.droppable',task);
			for(var i=0; i<drops.length; i++){
				var drags = $('.draggable',drops[i]);
				var arr=[];
				for(var j=0; j<drags.length; j++){
					arr.push(drags[j].innerHTML);
				}
				arr.sort();
				hash += arr.join('|') + '#';
			}
			
			console.log(hash);
			var isCorrect = check_answers($(task), hash);
			if(isCorrect){
				$('.draggable',task).draggable({disabled: true});
			}
		}
		
		function append_to_other_parent(moving_element, new_parent){
			var old_parent = $(moving_element).parent();
			var li = document.createElement('li');
			$(moving_element).appendTo(li);
			
			if($(new_parent).hasClass('sort')){
				$(li).appendTo($(new_parent).children('ul:first'));
			}else if($(new_parent).hasClass('words')){
				$(li).appendTo(new_parent);
			}else{
				throw new Error('Unexpected new_parent');
			}
			old_parent.remove();
			//$(moving_element).attr("style", "");
		}
		
		function init(){
			dragndrop = DragDropType.initType(typeClass);
			
			dragndrop.append_to_other_parent = append_to_other_parent;
			
			$('.task'+typeClass).each(function(n, task){
				$(task).data('check_answers', function(){
					check_task(task);
				});
				if($(task).hasClass('correct')){
					$('.draggable',task).draggable({disabled: true});
				}
			});
			
			$(typeClass+' .butreset').click(reset);
		}
		
		return lesson = {
			init: init,
            check_task: check_task,
            reset: reset
		};
    });
	LessonInterfaces.Chain = (function(typeClass){ // 11
		typeClass = '.'+typeClass;
		var lesson;
		
		function reset(e){
			var task = $(e.target).parents('.task');
			set_check(task);
			$('.bordersmall.answered',task).removeClass('answered');
		}

        function check_task(task){
            if($('.bordersmall',task).length==$('.bordersmall.answered',task).length){
                set_check(task, true);
            }else{
                set_check(task);
            }
        }

		function bordersmall_click_handler(e){
			var task = $(e.target).parents('.task');
			if(task.hasClass('correct')) return;
			var bordersmall = $(e.target).parents('.bordersmall')[0] || e.target;
			$(bordersmall).toggleClass('answered');

            check_task(task);
		}
		
		function init(){
			$(typeClass+' .butreset').click(reset);
			$(typeClass+' .bordersmall').click(bordersmall_click_handler);
			$('.task'+typeClass).each(function(n,task){
				if($(task).hasClass('correct')){
					$('.bordersmall',task).addClass('answered');
				}
			});
		}
		
		return lesson = {
			init: init,
            check_task: check_task,
            reset: reset
		};
    });
    LessonInterfaces.TextInput = (function(typeClass){ // 4
        typeClass = '.'+typeClass;
        var lesson;

        function reset(e){
            var task = $(e.target).parents('.task');
            set_check(task);
            $('input',task).val('');
        }
        function check_task(task){
            var isAllInputsReady=true;
            $('input',task).each(function(n, el){
                isAllInputsReady = isAllInputsReady && ((el.value.length>0) || ($(el).attr('answer')==''));
            });

            if(isAllInputsReady){
                check_inputs(task);
            }
        }
        function check_inputs(task){
            //*** Reset last state (cancel timer and  ***

            var timer = $(task).data('check_answers_timer');
            clearTimeout(timer);
            set_check(task);

            //*** Check correct ***
            var isRight=false;
            var count = 0;
            var check = 0;
            $('input',task).each(function(n,el){
            	var answers = 0;
            	count++;
            	if($(el).attr('answer').length != 0)
					var answers = $(el).attr('answer').toLowerCase().split('|');//replace(/[ \n\t\s+]/g, '').split('|');

				var value = trim($(el).val(), " ");

				if((in_array(value.toLowerCase(), answers) && value.length != 0) || (answers == 0 && value.length == 0))
				{
					if($(el).parents('.task').hasClass('typnine'))
						$(el).prev().prev('.if_correct').html(value);			
					else if($(el).parents('.task').hasClass('typseven'))
						$(el).prev('.if_correct').html(value);			
					else
						$(el).next('.if_correct').html(value);
					check++
				}
            });
            if(check == count) isRight = true;

            if(isRight){
                set_check(task, true);
                VirtualKeyBoardGUI.hide();
            }else{
                $(task).data('check_answers_timer', setTimeout(function(){
                    set_check(task, false);
                }, 1200));
            }
            return isRight;

            //*** Display result ***
            
        }
        function on_change(e){
            var task = $(e.target).parents('.task');
            set_check(task);
            check_task(task);
        }

        function init(){
            $(typeClass+' input').keypress(function(e){setTimeout(function(){on_change(e)},1)});
            $(typeClass+' input').change(on_change);
            $(typeClass+' .butreset').click(reset);
        }

        return lesson = {
            init: init,
            check_task: check_task,
            reset: reset
        };
    });
	LessonInterfaces.Crossword = (function(typeClass){ // 13
		typeClass = '.'+typeClass;
		var lesson;

		//*** Reset and answers ***
		function reset(e){
			var task = $(e.target).parents('.task');
			set_check(task);
			$('input:not(.readonly)',task).val('');
		}
		function check_task(task){
			var isFull=true;
			$('input',task).each(function(n,el){
				isFull = isFull && el.value.length;
			});
			if(isFull){
				check_answers(task, get_hash(task));
			}else{
				set_check(task);
			}
		}
		function get_hash(task){
			var hash='';
			$('input',task).each(function(n,el){
				hash += el.value;
			});
			return hash.toLowerCase();
		}

		//*** Focus movements ***
		function focus_prev(target){
			var prev = $(target).prev('input');
			if(!prev.length){
				prev = $(target).parent().prev().children('input:last');
			}
			if(!prev.length){
				prev = $(target);
			}
			prev.focus();
			select_input_text(prev[0]);
			if(prev.hasClass('readonly')) focus_prev(prev[0]);
		}
		function focus_next(target){
			var next = $(target).next('input');
			if(!next.length){
				next = $(target).parent().next().children('input:first');
			}
			if(next.length){
				next.focus();
				select_input_text(next[0]);
				if(next.hasClass('readonly')) focus_next(next[0]);
			}else{
				$(target).blur();
			}
		}
		function focus_up(target){
			var inp = $(target).parent().prev().children('input:first');
			inp.focus();
			select_input_text(inp[0]);
			if(inp.hasClass('readonly')) focus_next(inp[0]);
		}
		function focus_down(target){
			var inp = $(target).parent().next().children('input:first');
			inp.focus();
			select_input_text(inp[0]);
			if(inp.hasClass('readonly')) focus_next(inp[0]);
		}
		function readonly_focus_handler(e){
			$(e.target).blur();
		}
		function select_input_text(target){
			if (target.setSelectionRange) {
				target.focus();
				target.setSelectionRange(0, 1);
				//input_element.selectionStart = input_element.selectionEnd = pos;
			} else {
				if (target.createTextRange) {
					var rng = target.createTextRange();
					rng.collapse(true);
					rng.moveEnd("character", 1);
					rng.moveStart("character", 0);
					rng.select();
				}
			}
		}

		//*** Keypress handling ***
		function input_keypress_handler(e){
			e.preventDefault();
			var task = $(e.target).parents('.task');
			if(task.hasClass('correct')) return;

			if(e.keyCode==37){
				//focus_prev(e.target);
			}
			else if(e.keyCode==39 || e.keyCode==9){
				//focus_next(e.target);
			}
			else if(e.keyCode==38){
				//focus_up(e.target);
			}
			else if(e.keyCode==40 || e.which==13){
				//focus_down(e.target);
			}
			else if(e.keyCode==46){ // Delete
				//e.target.value='';
				//focus_next(e.target);
			}
			else if(e.which==8){ // Backspace
				//e.target.value='';
				//focus_prev(e.target);
			}
			else if(e.which){
				e.target.value=String.fromCharCode(e.which).toUpperCase();
				focus_next(e.target);
			}
			else{
				console.log(e);
			}
			check_task(task);
		}
		function input_keydown_handler(e){
			//e.preventDefault();
			var task = $(e.target).parents('.task');
			if(task.hasClass('correct')) return;

			if(e.keyCode==37){
				focus_prev(e.target);
			}
			else if(e.keyCode==39 || e.keyCode==9){
				focus_next(e.target);
			}
			else if(e.keyCode==38){
				focus_up(e.target);
			}
			else if(e.keyCode==40 || e.which==13){
				focus_down(e.target);
			}
			else if(e.keyCode==46){ // Delete
				e.target.value='';
				focus_next(e.target);
			}
			else if(e.which==8){ // Backspace
				e.target.value='';
				focus_prev(e.target);
			}
			else if(e.which){
				//e.target.value=String.fromCharCode(e.which).toUpperCase();
				//focus_next(e.target);
			}
			else{
				console.log(e);
			}
			check_task(task);
		}

		function init(){
			$(typeClass+' .butreset').click(reset);
			$(typeClass+' input')
				.keypress(input_keypress_handler)
				.keydown(input_keydown_handler)
				.data('focus_prev',focus_prev)
				.data('focus_next',focus_next)
				.focusout(input_keypress_handler);
			$(typeClass+' input.readonly').focus(readonly_focus_handler);
		}

		return lesson = {
			init: init,
            check_task: check_task,
            reset: reset,
			focus_prev: focus_prev,
			focus_next: focus_next
		};
    });
	
	LessonTypes.push(LessonInterfaces.DragAndDrop1('typfirst')); // 1
	LessonTypes.push(LessonInterfaces.DragAndDrop1('typsecond')); // 2
	LessonTypes.push(LessonInterfaces.TabQuiz1('typthird')); // 3
	LessonTypes.push(LessonInterfaces.TextInput('typfour')); // 4
	LessonTypes.push(LessonInterfaces.Listening('typfive')); // 5
	LessonTypes.push(LessonInterfaces.Gallery('typsix')); // 6
	LessonTypes.push(LessonInterfaces.TextInput('typseven')); // 7
	LessonTypes.push(LessonInterfaces.Categories('typeight')); // 8
	LessonTypes.push(LessonInterfaces.TextInput('typnine')); // 9
	LessonTypes.push(LessonInterfaces.DragAndDrop2('typten')); // 10
	LessonTypes.push(LessonInterfaces.Chain('typeleven')); // 11
	LessonTypes.push(LessonInterfaces.TabQuiz2('typtwelve')); // 12
    LessonTypes.push(LessonInterfaces.Crossword('typthirteen')); // 13
    LessonTypes.push(LessonInterfaces.Listening('typfourteen')); // 14
	LessonTypes.push(LessonInterfaces.DragAndDropTab('typsixteen')); // 16
    LessonTypes.push(LessonInterfaces.DragAndDropTab('seventeen')); // 17
    LessonTypes.push(LessonInterfaces.DragAndDropSprite('typeighteen')); // 18
    LessonTypes.push(LessonInterfaces.TabQuiz2('typnineteen')); // 19
    LessonTypes.push(LessonInterfaces.ListQuiz1('typtwenty')); // 20
	
	function init(){
		//console.profile('lessons_autorun');
		for(var i=0; i<LessonTypes.length; i++){
			LessonTypes[i] && LessonTypes[i].init && LessonTypes[i].init();
		}
		lesson_checker.init();
		//console.profileEnd('lessons_autorun');

        if(('undefined' !== typeof tests_lessons) && ('function' === typeof tests_lessons.start)){
            tests_lessons.start();
        }

	}
	
	return {
		init: init
	};
})();

$(function lessons_autorun(){
	console.log('autorun');
	//console.profile('lessons_autorun');
	// Init audio player
	AudioPlayerHTML5.init();
	AudioPlayerHTML5.bind_onplaying(LongPlayerControl.onplaying);
	AudioPlayerHTML5.bind_onplaying(SmallPlayerControl.onplaying);
	LongPlayerControl.init();
	SmallPlayerControl.init();
	
	// Init lessons
	LessonsCustomControl.init();
	
	// Init virtual keyboard
	VirtualKeyBoardGUI = VirtualKeyBoardGUI('.barkeybord:first', '.small-keyboard');
	//VirtualKeyBoardGUI.hide();
	
	// Topbar position
    var topbar = $('.topbar');
    if(topbar.length){
        var topbar_top = topbar.offset().top;
        var topbar_redraw = function topbar_redraw(e){
            if($(window).scrollTop() > topbar_top){
                $('.topbar').addClass('fix');
            }else{
                $('.topbar').removeClass('fix');
            }
        };
        $(window).scroll(topbar_redraw);
        topbar_redraw();
    }

    // Topbar intellisense
    Intellisense.init();
    function topbar_onkeypress(e){
        setTimeout(function(){
            Intellisense.update(e.target.value);
        });
    }
    topbar.find('input').keypress(topbar_onkeypress);
    topbar.find('input').blur(Intellisense.hide);
	//console.profileEnd('lessons_autorun');
});

/*if($.cookie('debug')){
    document.write('<script src="/s/js/pages/lessons_tests.js"></script>');
}*/
var FinalTestControl = (function TestControl_constructor(){
	var $test_area;
	var $timer_area;
	var $popup;
	var $popup_mask;
	var $start_btn;
	var test_id;
	var jdata;
	var tm;
	var seconds = 0;
	var letters = ["А","Б","В","Г","Д"];
	var enabled = false;
	var answers = [];
	var ans_re = /(\d+)_(\d+)/;
	var total = 0;
	var phase = 1;
	var phase_list = {
		1:	{
					limit: 48,
					level_class: 'a one',
					level: 'A1',
					level_text: 'Elementary'
				},
		2:	{
					limit: 78,
					level_class: 'a two',
					level: 'A2',
					level_text: 'Beginner'
				},
		3:	{
					limit: 100,
					level_class: 'b one',
					level: 'B1',
					level_text: 'Pre-Intermediate'
				}
	};
	var phase_count = 3;
	var phase_data;
	var time_limit = 3599;
	function init(){
		
		$test_area = $(".testwrap");
		test_id = $test_area.attr('id').match(/\d+/)[0];
		$(".t_answer").live("click",function(){
			if($popup.is(':visible')) return;
			var $elem = $(this);
			if(!enabled) {
				startClick();
			}
			
			$elem.parent().find(".active").removeClass("active");
			$elem.addClass("active");
			var matches = $elem.attr("id").match(ans_re);
			if(matches[1]) {
				answers[matches[1]] = matches[2];
			}
			testProgress();
		});
		$timer_area = $(".testtimer");
	    $start_btn = $timer_area.parent().find(".start_button");
		$start_btn.click(startClick);
		
		
		$popup = $(".plash");
		$popup.hide();
		$popup_mask = $('.pl_no_test');
		$popup_mask.hide();
		$('.yes', $popup).live('click', yes_button_click);
		$('.try', $popup).live('click', try_button_click);
		$('.no', $popup).live('click', function(){
				window.location.replace(window.location.href.replace(/\/([^/]*)$/, '/result/$1'));
			}
		);
		$('.test_reset', $popup).live('click', resetTest);
		
		
		$(".close",$popup).click(function(){$popup.hide();$start_btn.hide();});
	    $(".show_results.active").live("click",function(){
// 			window.location.replace("/tests/test-" + test_id +"/result/");
			window.location.replace(window.location.href.replace(/\/([^/]*)$/, '/result/$1'));
	    });
		testLoader();
		
	}
	
	function popup_show(data, percent, is_error){
		var parent = $(window);
		$popup.css({
			"margin": '0px',
			"top": (((parent.height() - $popup.outerHeight()) / 2) + parent.scrollTop() + "px"),
			"left": (((parent.width() - $popup.outerWidth()) / 2) + parent.scrollLeft() + "px")
		});
		
		if(is_error){
			$popup.attr('class', 'plash noforse');
			$('p', $popup).html('Your result is <span class="perc">' + percent + '%</span>. Would you like to try again?');
			$('.yes', $popup).addClass('try_again');
			$('.try', $popup).hide();
			
		} else {
			$('.perc', $popup).text(percent + '%');
			$popup.attr('class', 'plash noforse').addClass(data.level_class);
			$('.uh', $popup).text(data.level);
			$('#level_text', $popup).text(data.level_text);
			$('.try', $popup).show();
		}
		
		$popup.show();
		$popup_mask.show();
		
		if(!$('.show_results').is('.active'))
			$('.show_results').addClass('active');
	}
	
	function popup_hide(){
		$popup.hide();
		$popup_mask.hide();
	}
	
	function yes_button_click(){
		var elem = $(this);
		if(!elem.hasClass('try_again')){
			popup_hide();
			
			if(time_limit == 3599) time_limit = time_limit - phase_data.test_time;
			if(seconds == 0) seconds = seconds + phase_data.test_time;
			
			phase++;
			testDraw(phase_list[phase-1].limit, phase_list[phase].limit);
			$(window).scrollTop(0);
			tm = setInterval(timerTick, 1000);
			enabled = true;
			$start_btn.hide();
			$timer_area.html(timerFormat(time_limit));
			$timer_area.show();
		}else{
			try_button_click();
		}
	}
	
	function try_button_click(){
		popup_hide();
		time_limit = 3599;
		seconds = 0;
		if(phase == 1){
			testDraw(0, phase_list[phase].limit);
			$(window).scrollTop(0);
			tm = setInterval(timerTick, 1000);
			$start_btn.hide();
			$timer_area.html(timerFormat(time_limit));
			$timer_area.show();
		} else {
			phaseLoader(phase - 1, function(){
				time_limit = time_limit - phase_data.test_time;
				seconds = seconds + phase_data.test_time;
				testDraw(phase_list[phase - 1].limit, phase_list[phase].limit);
				$(window).scrollTop(0);
				tm = setInterval(timerTick, 1000);
				$start_btn.hide();
				$timer_area.html(timerFormat(time_limit));
				$timer_area.show();
			});
		}
		enabled = true;
	}
	
	function startClick() {
		tm = setInterval(timerTick, 1000);
		$timer_area.html(timerFormat(time_limit));
		enabled = true;
		$start_btn.hide();
		$timer_area.show();
	}
        
	function timerTick() {
		time_limit--;
		seconds++;
		if(time_limit == 0)
			testProgress();
		$timer_area.html(timerFormat(time_limit));
	}
	
	function timerFormat(sec) {
		//if(console) console.log(sec);
		var ts;
		var s = sec % 60;
		var min = Math.round((sec - s) / 60);
		var m = min % 60;
		var h = Math.round((min - m) / 60);

		s = s < 10 ? "0" + s : s;
		m  = m < 10 ? "0" + m: m;

		ts = (h > 0? h +":" : "") + m + ":" + s;
		return ts;
	}
        
	function testProgress() {
		var a = 0;
		for(i in answers) {
			if(answers[i] > -1) {
				a++;
			}
		}
		var answer_el_count = $('.testcontent', $test_area).length;
		if(a == answer_el_count) {
			enabled = false;
			$.ajax(
				{
					type: "POST",
					dataType: 'json',
					data: {answers: answers, time: seconds, phase_num: phase},
					url:" /tests/final_test_result/",
					success: function(data) {
						clearInterval(tm);
						if(data.json_percent > 66){
							phase_data = {
								test_time: seconds,
								phase_num: phase, 
								percent: data.json_percent
							};
							popup_show(phase_list[phase], data.json_percent);
						}else{
							popup_show(phase_list[phase], data.json_percent, 1);
						}
						
					}
				}
			)
		}
	}

	function testLoader() {
		$.ajax(
			{
				type: "POST",
				dataType: "json",
				data: { test_num: test_id },
				url:"/tests/test_answer/",
				success:function(data){jdata=data; phaseLoader(0,prepareTest)},
				error: function(){}
			}
		)
	}
	
	function phaseLoader(phase_num, callback) {
		$.ajax(
			{
				type: "POST",
				dataType: "json",
				data: { test_num: test_id, phase_num: phase_num},
				url:"/tests/test_phase/",
				success:function(data){phase_data=data.json_phase_data; if(callback) callback();},
				error: function(){}
			}
		)
	}
	var prepareTest = function (){
		if(phase_data && phase_data.phase_num){
			phase = phase_data.phase_num;
			popup_show(phase_list[phase], phase_data.percent);
		} else {
			testDraw(0, phase_list[phase].limit);
		}
	}
	
	function resetTest(){
		$.ajax(
			{
				type: "POST",
				dataType: "json",
				data: { test_num: test_id },
				url:"/tests/test_reset/",
				success:function(data){
					popup_hide();
					phase = 1;
					seconds = 0;
					time_limit = 3599;
					testDraw(0, phase_list[phase].limit);
					$(window).scrollTop(0);
					enabled = false;
					$start_btn.show();
					$timer_area.hide();
					$('.show_results').removeClass('active');
				},
				error: function(){}
			}
		)
	
	}
	
	function testDraw(start, finish) {
		var idx = 0;
		if(phase > phase_count) return;
		$test_area.empty();
		answers = [];
		var i = 0;
		for(idx = start; idx < finish; idx++){
		//for(var idx in jdata.json_tasks) {
			jdata.json_tasks[idx].index =  parseInt(idx);
			answers[i] = -1;
			$test_area.append(makeTestTask(jdata.json_tasks[idx], i));
			i++;
		}
	}

	function makeTestTask(obj, array_index) {
		var html = '<div class="task testcontent" id="task-'+array_index+'"><div class="ltask">' +(obj.index+1)+'.</div>';
		html += '<div class="ctask"><h2>'+obj.task + '</h2><div class="t_answers">';
		var variants = [];
		variants = shuffle(obj.answers);
		for(var idx2 = 0; idx2 < variants.length; idx2++) {
			html += '<div class="t_answer" id="' + array_index + '_'+obj.answers[idx2].id + '"><div class="t_left"></div><div class="t_mid">';
			html += letters[idx2] + '. ' + obj.answers[idx2].text + '</div><div class="t_right"></div></div>';
		}
		html += '</div></div></div>';
		return html;
	}
        
	function shuffle(arr) {
		for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
		return arr;
	}

	return {
		init: init
	};
})();

$(function test_autorun(){
	console.log('test_autorun');

	// Topbar position
	var topbar_top = $('.topbar').offset().top;
	console.log(topbar_top);
	var topbar_redraw = function topbar_redraw(e){
		if($(window).scrollTop() > topbar_top){
			$('.topbar').addClass('fix');
		}else{
			$('.topbar').removeClass('fix');
		}
	};
	$(window).scroll(topbar_redraw);
	topbar_redraw();
	FinalTestControl.init();
	//console.profileEnd('lessons_autorun');
});


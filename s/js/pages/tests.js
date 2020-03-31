var TestControl = (function TestControl_constructor(){
	var $test_area;
	var $timer_area;
	var $popup;
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
	var answered = 0;
	function init(){
		answered = 0;
		total = 0;
		$test_area = $(".testwrap");
		test_id = $test_area.attr('id').match(/\d+/)[0];
		$(".t_answer").live("click",function(){
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
		testLoader();
		$popup = $(".testcompleted.popup");
		$(".close",$popup).click(function(){$popup.hide()});
	    $(".show_results.active").live("click",function(){
// 			window.location.replace("/tests/test-" + test_id +"/result/");
			window.location.replace(window.location.href.replace(/\/([^/]*)$/, '/result/$1'));
	    });
	}
	
	function startClick() {
		tm = setInterval(timerTick, 1000);
		$timer_area.html("00:00");
		enabled = true;
		$start_btn.hide();
		$timer_area.show();
	}
        
	function timerTick() {
		seconds++;
		$timer_area.html(timerFormat(seconds));

	}
	
	function timerFormat(sec) {
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
		answered = a;
		if(a == total) {
			clearInterval(tm);
			enabled = false;

			$.ajax(
				{
					type: "POST",
					dataType: 'json',
					data: {answers: answers, time: seconds},
					url:" /tests/test_result/",
					success: function(data) {
						$(".show_results").addClass("active");
						$popup.find(".est_time").html(timerFormat(seconds));
						$popup.show();
						$popup.find(".percent").html(data.json_percent);
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
				success:function(data){jdata=data; testDraw();},
				error: function(){}
			}
		)
	}
        
	function testDraw() {
		for(var idx in jdata.json_tasks) {
			jdata.json_tasks[idx].index =  parseInt(idx);
			answers[idx] = -1;
			total++;
			$test_area.append(makeTestTask(jdata.json_tasks[idx]));
		}
	}

	function makeTestTask(obj) {
		var html = '<div class="task testcontent" id="task-'+obj.index+'"><div class="ltask">' +(obj.index+1)+'.</div>';
		html += '<div class="ctask"><h2>'+obj.task + '</h2><div class="t_answers">';
		var variants = [];
		variants = shuffle(obj.answers);
		for(var idx2 = 0; idx2 < variants.length; idx2++) {
			html += '<div class="t_answer" id="'+ obj.index+'_'+obj.answers[idx2].id + '"><div class="t_left"></div><div class="t_mid">';
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
	TestControl.init();
	//console.profileEnd('lessons_autorun');
});


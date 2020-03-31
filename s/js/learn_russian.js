'use strict';

/************************************************************************************
***********************   Unsupported browsers redirect   ***************************
************************************************************************************/
(function Unsupported(){
    var unsupport_url = '/?name=oops-web-brouser';
    var unsupported = [
        ['firefox',3],
        ['chrome',15],
		['opera', 9.8],
        ['safari',5],
        ['explorer',7]
    ];

    function is_supported(name, version){
        var item;
        for(var i=0; i<unsupported.length; i++){
            item = unsupported[i];
            if((name.toLowerCase() == item[0].toLowerCase()) && (version < item[1])){
                return false;
            }
        }
        return true;
    }

    if(!~location.href.indexOf(unsupport_url) && !is_supported(BrowserDetect.browser, BrowserDetect.version)){
        location.href=unsupport_url;
    }
})();

/************************************************************************************
******************************   Syntactic sugar   **********************************
************************************************************************************/
Function.prototype.bind = function bind(obj, args){
	var func = this;
	var linkFunction = function linkFunction(){
		var ar = [];
		for(var i=0; (args || [])[i]; i++) {
			ar.push(args[i]);
		}
		for(var j=0; arguments[j]; j++) {
			ar.push(arguments[j]);
		}
		return func.apply(obj || window, ar);
	};
	linkFunction.prototype = func.prototype;
	return linkFunction;
};

/************************************************************************************
*****************************   Virtual Keyboard   **********************************
************************************************************************************/

var VirtualKeyBoard = VirtualKeyBoard || (function VirtualKeyBoard_constructor(glob){
	var module;
	var input_element=null, keyboard_element=null;
	var isVisible=false;
	
	function init(keyboard){
		keyboard_element=keyboard;
		isVisible = !!$.cookie('is_keyboard_visible');
		if(isVisible) show();
	}
	
	function show(){
		//if(isVisible==true) return;
		isVisible=true;
		$.cookie('is_keyboard_visible', true);
		$(keyboard_element).show();
        $('#conteiner').addClass('keyboardmode');
	}
	function hide(){
		//if(isVisible==false) return;
		isVisible=false;
		$.cookie('is_keyboard_visible', null);
		$(keyboard_element).hide();
        $('#conteiner').removeClass('keyboardmode');
	}
	
	function change_element(el){
		input_element=el;
	}
	
	function set_caret_pos(pos){
		if (input_element.setSelectionRange) {
            input_element.focus();
            input_element.setSelectionRange(pos, pos);
			//input_element.selectionStart = input_element.selectionEnd = pos;
        } else {
            if (input_element.createTextRange) {
                var rng = input_element.createTextRange();
                rng.collapse(true);
                rng.moveEnd("character", pos);
                rng.moveStart("character", pos);
                rng.select();
            }
        }
        setTimeout(function(){input_element.focus()},10);
	}
	
	function get_caret_pos(){
		if(document.selection){ // If IE
			var b = document.selection.createRange().duplicate();
			var start, end;
			b.moveEnd("character", input_element.value.length);
			if (b.text == "") {
				start = input_element.value.length;
			} else {
				start = input_element.value.lastIndexOf(b.text);
			}
			b = document.selection.createRange().duplicate();
			b.moveStart("character", -input_element.value.length);
			end = b.text.length;
			if(end<start) end=start;
			return {
				start: start,
				end: end
			};
		}
		// If other browser
		else if(('number' == typeof input_element.selectionStart) && ('number' == typeof input_element.selectionEnd)){
			return {
				start: input_element.selectionStart,
				end: input_element.selectionEnd
			};
		}
		else {
			remoteLoger("Error: can't get caret position");
            return {
                start: input_element.value.length,
                end: input_element.value.length
            }
		}
	}
	
	function press_key(ch){
		if(input_element==null) return;
		ch=(""+ch);
		var pos=get_caret_pos();
		var old=input_element.value;
		if($(input_element).hasClass('rewritable')){
			input_element.value=ch;
			var func = $(input_element).data('focus_next');
			if('function' == typeof func) func(input_element);
		}
		else{
			input_element.value=old.substring(0, pos.start) + ch + old.substring(pos.end);
			$(input_element).keypress();
		}
		$(input_element).focus();
		set_caret_pos(pos.start+ch.length);
		show();
	}
	
	function press_backspace(){
		var pos=get_caret_pos();
		var old=input_element.value;
		if($(input_element).hasClass('rewritable')){
			input_element.value='';
			var func = $(input_element).data('focus_prev');
			if('function' == typeof func) func(input_element);
		}
		else{
			input_element.value=old.substring(0, pos.start-1) + old.substring(pos.end);
		}
		$(input_element).focus();
		set_caret_pos(pos.start-1);
		show();
	}
	
	return module = {
		init: init,
		show: show,
		hide: hide,
		change_element: change_element,
		get_caret_pos: get_caret_pos,
		set_caret_pos: set_caret_pos,
		press_key: press_key,
		press_backspace: press_backspace,
		visible: function(){return isVisible}
	};
})(window);

var VirtualKeyBoardGUI = (function VirtualKeyBoardGUI_constructor(keyboard, pic){
	keyboard=$(keyboard);
	pic=$(pic);
	var state='normal', isCapsLock;
	
	//*** Keyboard states ***
	function showNormal(){
		state='normal';
		//        0   1   2   3   4   5   6   7   8   9
		var arr=['ё','1','2','3','4','5','6','7','8','9',
				 '0',' ','й','ц','у','к','е','н','г','ш',
				 'щ','з','х','ъ','ф','ы','в','а','п','р',
				 'о','л','д','ж','э',' ','я','ч','с','м',
				 'и','т','ь','б','ю','.',' ',' '];
		$('.b-keyboard-key-m',keyboard).each(function(n,el){
			if(arr[n] != ' '){
				el.innerHTML=arr[n];
			}
		});
		keyboard.find('.keybord>p:first').hide();
	}
	function showShift(){
		state='shift';
		//        0   1   2   3   4   5   6   7   8   9
		var arr=['Ё','!','"','№',';','%',':','?','*','(',
				 ')',' ','Й','Ц','У','К','Е','Н','Г','Ш',
				 'Щ','З','Х','Ъ','Ф','Ы','В','А','П','Р',
				 'О','Л','Д','Ж','Э',' ','Я','Ч','С','М',
				 'И','Т','Ь','Б','Ю','.',' ',' '];
		$('.b-keyboard-key-m',keyboard).each(function(n,el){
			if(arr[n] != ' '){
				el.innerHTML=arr[n];
			}
		});
		keyboard.find('.keybord>p:first').hide();
	}
	function showCapsLock(){
		state='capslock';
		//        0   1   2   3   4   5   6   7   8   9
		var arr=['Ё','1','2','3','4','5','6','7','8','9',
				 '0',' ','Й','Ц','У','К','Е','Н','Г','Ш',
				 'Щ','З','Х','Ъ','Ф','Ы','В','А','П','Р',
				 'О','Л','Д','Ж','Э',' ','Я','Ч','С','М',
				 'И','Т','Ь','Б','Ю','.',' ',' '];
		$('.b-keyboard-key-m',keyboard).each(function(n,el){
			if(arr[n] != ' '){
				el.innerHTML=arr[n];
			}
		});
		keyboard.find('.keybord>p:first').show();
	}
	function showAsIs(){
		VirtualKeyBoard.show();
		pic.removeClass('hov').addClass('click');
	}
	function hideKeyboard(){
		VirtualKeyBoard.hide();
		pic.removeClass('click').addClass('hov');
	}
	function drawKeyDown(target){
		if($(target.parentNode).hasClass('b-keyboard-key-m'))
			target = target.parentNode;
		
		if($(target).hasClass('b-keyboard-key-m')){
			$(target).next().addClass('push');
			$(target).addClass('push');
			$(target).prev().addClass('push');
		}
	}
	function drawKeyUp(){
		$('.push',keyboard).removeClass('push');
	}
	
	//*** Initialization ***
	VirtualKeyBoard.init(keyboard[0]);
	if(VirtualKeyBoard.visible()) pic.addClass('click');
	$('input')
		.focus(function (e){
			VirtualKeyBoard.change_element(e.target);
		})
		.blur(function (e){
			//VirtualKeyBoard.change_element(null);
		});
	
	pic	
		.click(function (e){
			var el = $(e.target);
			if(keyboard.css('display')=='none'){
				showAsIs();
			}else{
				hideKeyboard();
			}
		})
		.hover(function(e){
			var el = $(e.target);
			if(!el.hasClass('click')) el.addClass('hov');
		});
	
	$(document.body).keydown(function(ev){
		if(ev.which==16){ // Shift
			showShift();
		}
		if(ev.which==20){ // Capslock
			if(!isCapsLock){
				showCapsLock();
			}else{
				if(ev.shiftKey){
					showShift();
				}else{
					showNormal();
				}
			}
			isCapsLock = !isCapsLock;
		}
		var ch = String.fromCharCode(ev.which);
		//        0   1   2   3   4   5   6   7   8   9
		var arr=['Ё','1','2','3','4','5','6','7','8','9',
				 '0', 8 ,'Q','W','E','R','T','Y','U','I',
				 'O','P',219,221,'A','S','D','F','G','H',
				 'J','K','L',';',222, 16,'Z','X','C','B',
				 'B','N','M',188,190,191, 16,' '];
		for(var n=0; n<arr.length; n++){
			if((arr[n] === ev.which) || (arr[n] === ch)){
				drawKeyDown($('.b-keyboard-key-m:eq('+n+')',keyboard)[0]);
			}
		}
	});
	$(document.body).keyup(function(ev){
		drawKeyUp();
		if(ev.which==16){ // Shift
			if(isCapsLock){
				showCapsLock();
			}else{
				showNormal();
			}
		}
	});
	$(document.body).keypress(function(ev){
		var ch = String.fromCharCode(ev.which);
		var lower = (ch === ch.toLowerCase());
		var upper = (ch === ch.toUpperCase());
		var new_capslock_state;
		if(lower && !upper){
			new_capslock_state = ev.shiftKey;
		}else if(upper && !lower){
			new_capslock_state = !ev.shiftKey;
		}else{
			return;
		}
		if(new_capslock_state != isCapsLock){
			if(new_capslock_state){
				showCapsLock();
			}else{
				showNormal();
			}
		}
		isCapsLock = new_capslock_state;
	});
	
	keyboard.mousedown(function(e){
		e.preventDefault();
		drawKeyDown(e.target);
	});
	keyboard.mouseup(function(e){
		e.preventDefault();
		drawKeyUp();
	});
	
	$('.b-keyboard-key-m',keyboard).click(function(e){
		var cancel_shift = (state=='shift');
	
		if($(e.target).hasClass('bgshift') || $('.bgshift',e.target).length){
			showShift();
		}
		else if($(e.target).hasClass('bgbackspace') || $('.bgbackspace',e.target).length){
			VirtualKeyBoard.press_backspace();
		}
		else{
			var key=e.target.innerHTML;
			if(key=='&nbsp;') key=' ';
			VirtualKeyBoard.press_key(key);
		}
		
		if(cancel_shift && !e.shiftKey) showNormal();
	});
	$('.output',keyboard).click(hideKeyboard);
	showNormal();
	
	return {
		show: showAsIs,
		hide: hideKeyboard
	}
});

/************************************************************************************
*******************************   Audio Player   ************************************
************************************************************************************/

var AudioPlayerSWF = AudioPlayerSWF || (function AudioPlayerSWF_constructor(){
	var module, element=null, player=null;
	var onSWFReady_handlers=[], onPlaying_handlers=[];
	var last_url;
	
	function init(){
		if(element != null) return false;
		var html='';
		
		if((BrowserDetect.version<=8) && (BrowserDetect.browser=='Explorer')){
            var size = 'width="1" height="1"';
            var url = 'audioplayer';
            //var url = 'test';

			html+='<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" id="audioplayer" '+size+'>';
			html+='<param name="movie" value="/s/swf/'+url+'.swf" />\n';
			html+='<param name="quality" value="high" />\n';
			html+='<param name="bgcolor" value="#000000" />\n';
			html+='<param name="play" value="true" />\n';
			html+='<param name="loop" value="true" />\n';
			//html+='<param name="wmode" value="transparent" />\n';
			html+='<param name="scale" value="showall" />\n';
			html+='<param name="menu" value="true" />\n';
			html+='<param name="devicefont" value="false" />\n';
			html+='<param name="salign" value="" />\n';
			html+='<param name="allowScriptAccess" value="sameDomain" />\n';
			html+='<param name="flashvars" value="jsready=isJSReady&swfready=setSWFReady" />\n';
			html+='<!--[if !IE]>-->\n';
			html+='<embed src="/s/swf/'+url+'.swf" quality="high" bgcolor="#000000" '+size+' name="audioplayer" align="middle" play="true" loop="true" allowScriptAccess="sameDomain" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="jsready=isJSReady&swfready=setSWFReady"></embed>\n';
			html+='<!--<![endif]-->';
			html+='</object>';
			
			element=document.createElement('div');
			element.innerHTML=html;
		}else{
			html+='<param name="movie" value="/s/swf/audioplayer.swf" />\n';
			html+='<param name="quality" value="high" />\n';
			html+='<param name="bgcolor" value="#000000" />\n';
			html+='<param name="play" value="true" />\n';
			html+='<param name="loop" value="true" />\n';
			html+='<param name="wmode" value="transparent" />\n';
			html+='<param name="scale" value="showall" />\n';
			html+='<param name="menu" value="true" />\n';
			html+='<param name="devicefont" value="false" />\n';
			html+='<param name="salign" value="" />\n';
			html+='<param name="allowScriptAccess" value="sameDomain" />\n';
			html+='<param name="flashvars" value="jsready=isJSReady&swfready=setSWFReady" />\n';
			html+='<!--[if !IE]>-->\n';
			html+='<embed src="/s/swf/audioplayer.swf" quality="high" bgcolor="#000000" width="1" height="1" name="audioplayer" align="middle" play="true" loop="true" allowScriptAccess="sameDomain" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="jsready=isJSReady&swfready=setSWFReady" wmode="transparent"></embed>\n';
			html+='<!--<![endif]-->';
			
			element=document.createElement('object');
			element.innerHTML=html;
			element.classid='clsid:d27cdb6e-ae6d-11cf-96b8-444553540000';
			//element.width=100;
			//element.height=100;
			element.id='audioplayer';
			element.align='middle';
		}
		
		document.body.appendChild(element);
	}
	function setSWFReady(){
		//alert('SWF Ready');
		if(navigator.appName.indexOf("Microsoft") != -1 ) {
			player = window.audioplayer;	
		} else {
			player = window.document.audioplayer;
		}
		
		player.setTickCb("AudioPlayerSWF.swfGate.tick"); //функция обновления времени
		player.setNotifyCb("AudioPlayerSWF.swfGate.notify"); //уведомительные сообщения
		player.setErrorCb("AudioPlayerSWF.swfGate.error"); //ошибки
		
		for(var i=onSWFReady_handlers.length; i>0; i--){
			var obj=onSWFReady_handlers.pop();
			obj.cb.apply(null, obj.args);
		}
	}
	function isJSReady(){
		//alert('JS Ready');
		return (element!=null);
	}
	
	//*** User commands ***
	function play(url){
		url = url || last_url;
		player && player.play(url || last_url); //плей, воспроизведение либо сначала либо с момента паузы
		last_url=url;
	}
	function stop(){
		player && player.stop(); //стоп, тормозит воспроизведение, загрузка файла не останавливается
	}
	function pause(){
		player && player.pause(); //пауза, текущее положение воспроизведения сохраняется внутри флешки
	}
	function setVolume(vol){
		player && player.volume(100*vol); //громкость, 0-100, есть проверка внутри на максимум/минимум
	}
	function setTime(sec){
		player && player.playFrom(sec);
	}
	
	//*** Events binding and rising ***
	function bind_onswfready(cb, args){
		args = args || [];
		if(player){
			cb.apply(null, args);
		}
		else{
			onSWFReady_handlers.push({cb: cb, args: args});
		}
	}
	function bind_onplaying(cb){
		if('function' != typeof cb) throw new Error('Type of cb must be function');
		onPlaying_handlers.push({cb: cb});
	}
	function rise_onplaying(cmd, args){
		for(var i=0; i<onPlaying_handlers.length; i++){
			onPlaying_handlers[i].cb(cmd, args);
		}
	}
	function tick(sCurrent, sTotal){ //первый аргумент-текущее положение в секундах, второй-длина трека в секундах
		rise_onplaying('newtime', {current: sCurrent, total: sTotal});
	}
	function notify(cmd, data){
		if(cmd == "loaded") {
			data={ratio:parseInt(data)/100};
		}
		else if(cmd == "complete") {
			data=parseInt(data);	
		}
		rise_onplaying(cmd, data);
		
	}
	function error(e, text){
		rise_onplaying('error', {e:e, text: text});
	}
	
	//*** Publication ***
	return module = {
		swfGate: {
			setSWFReady: setSWFReady,
			isJSReady: isJSReady,
			tick: tick,
			notify: notify,
			error: error
		},
		init: init,
		play: play,
		stop: stop,
		pause: pause,
		setVolume: setVolume,
		setTime: setTime,
		bind_onswfready: bind_onswfready,
		bind_onplaying: bind_onplaying
	}
})();

window.isJSReady=AudioPlayerSWF.swfGate.isJSReady;
window.setSWFReady=AudioPlayerSWF.swfGate.setSWFReady;

var AudioPlayerHTML5=(function AudioPlayerHTML5_constructor(){
	var module, player=null;
	var onPlaying_handlers=[];
	
	//*** User commands ***
	function play(url){
		var source = url;
		if (player.canPlayType('audio/mpeg;')) {
			source= url;
		} else {
			source= url.replace('.mp3','.ogg');
		}
		player && url && (player.src=source);
		player && player.play();
	}
	function stop(){
		player && player.stop();
	}
	function pause(){
		player && player.pause();
	}
	function setVolume(vol){
		player.volume=vol;
	}
	function setTime(sec){
		player && (player.currentTime=sec);
	}
	
	//*** Events binding and rising ***
	function bind_onplaying(cb){
		if('function' != typeof cb) throw new Error('Type of cb must be function');
		onPlaying_handlers.push({cb: cb});
	}
	function rise_onplaying(cmd, args){
		for(var i=0; i<onPlaying_handlers.length; i++){
			onPlaying_handlers[i].cb(cmd, args);
		}
	}
	function tick(){
		rise_onplaying('newtime', {current: player.currentTime, total: player.duration});
	}
	function ended(e){
		rise_onplaying("complete", 1);
	}
	function notify(cmd, data){
		if(cmd == "loaded") {
			data={ratio:parseInt(data)/100};
		}
		else if(cmd == "complete") {
			data=parseInt(data);	
		}
		rise_onplaying(cmd, data);
	}
	function error(e, text){
		rise_onplaying('error', {e:e, text: text});
	}
	
	//*** Initialization ***
	function init(){
		player=document.createElement('audio');
		document.body.appendChild(player);
		$(player).bind('timeupdate', tick);
		$(player).bind('ended', ended);
		$(player).bind('error', error);
	}
	
	//*** Publication ***
	return module = {
		init: init,
		play: play,
		stop: stop,
		pause: pause,
		setVolume: setVolume,
		setTime: setTime,
		bind_onplaying: bind_onplaying
	}
})();

var LongPlayerControl = (function LongPlayerControl_constructor(AudioPlayer){
	var player_ui;
	var timing_current, timing_total, loading_percentage, volume, isMute, track_uri;
	var seeking, voluming;
	
	function vars_init(){
		player_ui=null;
		timing_current=0;
		timing_total=0;
		loading_percentage=0;
		track_uri='';
		seeking=false;
		voluming=false;
		volume=1;
		isMute=false;
	}
	
	//*** Handlers ***
	function play(){
		$('.players.playing').removeClass('playing');
		player_ui.addClass('playing');
		track_uri=player_ui.children('.plpau').attr('audio');
		AudioPlayer.play(track_uri);
	}
	function pause(){
        player_ui && player_ui.removeClass('playing');
		AudioPlayer.pause();
	}
	function play_click_handler(e){ // play/pause handler
		player_ui = $(e.target).parent('.players');
		
		if(!player_ui.hasClass('playing')){
			play();
		}
		else{
			pause();
		}
	}
	//Volume
	function mute_click_handler(e){
		if(!isMute){
			isMute=true;
			draw_volume();
			AudioPlayer.setVolume(0);
		}
		else{
			isMute=false;
			draw_volume();
			AudioPlayer.setVolume(volume);
		}
	}
	function mute_mousedown_handler(e){
		if(e.button!=0) return;
		$(e.target).parents('.sound').addClass('active');
	}
	function mute_mouseup_handler(e){
		if(e.button!=0) return;
		$(e.target).parents('.sound').removeClass('active');
	}
	function vnsound_generic_handler(e){
		var player_ui_temp = $(e.target).parents('.players');
		var reg_panel=$('.swvolume',player_ui_temp);
		var v=((e.clientX-reg_panel.offset().left)/parseInt(reg_panel.width()));
		if(v<0) v=0; if(v>1) v=1;
		volume=v;
		isMute=false;
		draw_volume();
		AudioPlayer.setVolume(v);
	}
	function vnsound_down_handler(e){
		e.preventDefault();
		if(voluming) return;
		voluming=true;
		vnsound_generic_handler(e);
	}
	function vnsound_move_handler(e){
		e.preventDefault();
		if(!voluming) return;
		vnsound_generic_handler(e);
	}
	function vnsound_up_handler(e){
		e.preventDefault();
		if(!voluming) return;
		voluming=false;
		vnsound_generic_handler(e);
	}
	//Time seek
	function clickstrip_generic_handler(e){
		var y=(e.clientX-$('.clickstrip',player_ui).offset().left)/354;
		if(y<0) y=0; if(y>1) y=1;
		var s=y*timing_total;
		timing_current=s;
		draw_time();
		AudioPlayer.setTime(s);
	}
	function clickstrip_down_handler(e){
		e.preventDefault();
		var isItPlayingOne = $(e.target).parent('.players').hasClass('playing');
		if(seeking || !isItPlayingOne) return;
		seeking=true;
		clickstrip_generic_handler(e);
	}
	function clickstrip_move_handler(e){
		e.preventDefault();
		var isItPlayingOne = $(e.target).parent('.players').hasClass('playing');
		if(!seeking || !isItPlayingOne) return;
		clickstrip_generic_handler(e);
	}
	function clickstrip_up_handler(e){
		e.preventDefault();
		var isItPlayingOne = $(e.target).parent('.players').hasClass('playing');
		if(!seeking || !isItPlayingOne) return;
		seeking=false;
		clickstrip_generic_handler(e);
	}
	
	//*** Drawing ***
	function draw_time(){
		var width=8+timing_current/timing_total*346;
		$('.playerstrip',player_ui).css({width: Math.round(width)+'px'});
		var m=Math.floor(timing_current/60); m=(m<10 ? '0' : '')+m;
		var s=Math.floor(timing_current%60); s=(s<10 ? '0' : '')+s;
		$('.time span',player_ui).html(m+' : '+s);
	}
	function draw_loading(){
		var width=8+loading_percentage*346;
		$('.loadstrip',player_ui).css({width: Math.round(width)+'px'});
	}
	function draw_volume(){
		if(isMute){
			$('.players .sound').removeClass('sr');
			$('.players .volume').css({width: '0px'});
		}
		else{
			$('.players .sound').addClass('sr');
			$('.players .volume').css({width: Math.round(volume*20)+'px'});
		}
	}
	
	//*** Event handling ***
	function onplaying(cmd, args){
		if(cmd=='newtime'){
			timing_current=args.current;
			timing_total=args.total;
			draw_time();
		}
		else if(cmd=='loaded'){
			loading_percentage=args.ratio;
			draw_loading();
		}
		else if(cmd=='complete'){
			AudioPlayer.setTime(0);
			pause();
		}
		else if(cmd=='error'){
			pause();
			throw new Error("Error in AudioPlayer");
		}
	}
	
	//*** Initialisation ***
	function init(){
		//*** Setting zero-state
		vars_init();
		draw_volume();
		
		//*** Binding
		$('.players .play').click(play_click_handler);
		
		$('.players .clickstrip').mousedown(clickstrip_down_handler);
		$('.players .clickstrip').mousemove(clickstrip_move_handler);
		$('.players .clickstrip').mouseup(clickstrip_up_handler);
		$('.players .clickstrip').mouseout(clickstrip_up_handler);
		$('.players .clickstrip').mouseleave(clickstrip_up_handler);
		
		$('.players .swvolume').mousedown(vnsound_down_handler);
		$('.players .swvolume').mousemove(vnsound_move_handler);
		$('.players .swvolume').mouseup(vnsound_up_handler);
		$('.players .swvolume').mouseout(vnsound_up_handler);
		$('.players .swvolume').mouseleave(vnsound_up_handler);
		
		$('.players .swsound').click(mute_click_handler);
		$('.players .swsound').mousedown(mute_mousedown_handler);
		$('.players .swsound').mouseup(mute_mouseup_handler);
	}
	vars_init();
	
	//*** Publication ***
	return {
		init: init,
		onplaying: onplaying
	};
});

var SmallPlayerControl = (function SmallPlayerControl_constructor(AudioPlayer){
	var player_ui;
	var timing_current, timing_total, loading_percentage, track_uri;
	
	function vars_init(){
		player_ui=null;
		timing_current=0;
		timing_total=0;
		loading_percentage=0;
		track_uri='';
	}
	
	//*** Handlers ***
    function play(){
        $('.playtwo.playing').removeClass('playing');
        player_ui.addClass('playing');
        track_uri=player_ui.attr('audio');
        AudioPlayer.play(track_uri);
    }
    function pause(){
        player_ui && player_ui.removeClass('playing');
        AudioPlayer.pause();
    }
	function play_click_handler(e){ // play/pause handler
		player_ui = $(e.target).parent('.playtwo');
		
		if(!player_ui.hasClass('playing')){
            play(player_ui);
		}else{
            pause(player_ui);
		}
	}
	function set_volume_handler(e){
		
	}
	
	//*** Event handling ***
	function onplaying(cmd, args){
        if(cmd=='complete'){
            AudioPlayer.setTime(0);
            pause();
        }
        else if(cmd=='error'){
            pause();
            throw new Error("Error in AudioPlayer");
        }
	}
	
	//*** Initialisation ***
	function init(){
		//*** Setting zero-state
		vars_init();
		
		//*** Binding
		$('.playtwo .plpau').click(play_click_handler);
	}
	vars_init();
	
	//*** Publication ***
	return {
		init: init,
		onplaying: onplaying
	};
});

// var test_audio= document.createElement("audio") //try and create sample audio element
// var audio_support=(test_audio.play)? true : false;

// if(!audio_support){
	// LongPlayerControl = LongPlayerControl(AudioPlayerSWF);
	// SmallPlayerControl = SmallPlayerControl(AudioPlayerSWF);
// } else {
	// LongPlayerControl = LongPlayerControl(AudioPlayerHTML5);
	// SmallPlayerControl = SmallPlayerControl(AudioPlayerHTML5);
// }

if(BrowserDetect.browser=='Opera'){
	// LongPlayerControl = LongPlayerControl(AudioPlayerHTML5);
	// SmallPlayerControl = SmallPlayerControl(AudioPlayerHTML5);
	LongPlayerControl = LongPlayerControl(AudioPlayerSWF);
	SmallPlayerControl = SmallPlayerControl(AudioPlayerSWF);

}else if(BrowserDetect.browser=='Safari'){
	LongPlayerControl = LongPlayerControl(AudioPlayerHTML5);
	SmallPlayerControl = SmallPlayerControl(AudioPlayerHTML5);
	
}else{
	LongPlayerControl = LongPlayerControl(AudioPlayerHTML5);
	SmallPlayerControl = SmallPlayerControl(AudioPlayerHTML5);

}
/************************************************************************************
********************************   Intellisense   ***********************************
************************************************************************************/
var Intellisense = (function(){
    var elem=null;

    function on_success(data){
        var items = data.json_list;
        var html = '';
        for(var i=0; i<items.length; i++){
            html += '<div>'+items[i]+'</div>';
        }
        if(html){
            elem.html(html).show();
        }else{
            elem.hide();
        }
    }
    function update(text){
        var url = $('.isearch:first').next().children('a:first').attr('href');
        var data = {query: text};
        $.ajax({
            url: url,
            type: 'POST',
            data: data,
            dataType: 'json',
            success: on_success
        });
    }
    function show(){
        elem.show();
    }
    function hide(){
        elem.hide();
    }

    function init(){
        elem = $('.intellisense');
    }

    return {
        init: init,
        update: update,
        show: show,
        hide: hide
    }
})();

/************************************************************************************
 **********************************   Bookmarks   ************************************
 ************************************************************************************/
function bookmark_click(lesson_id, task_id) {
  var div = $("#task-" + task_id + " div.bookmark");
  if (div.hasClass('none')) return;
  if (div.html() && div.find('ul').length) {
    div.empty();
    return;
  }
  var s = '<ul style="display: none;">' +
          '<li class="none" onclick="bookmark_select(' + lesson_id + ', ' + task_id + ', \'none1\')">&nbsp;</li>' +
          '<li class="yestar' + (div.hasClass('yestar') ? ' none' : ('" onclick="bookmark_select(' + lesson_id + ', ' + task_id + ', \'yestar\')')) + '">&nbsp;</li>' +
          '<li class="problem' + (div.hasClass('problem') ? ' none' : ('" onclick="bookmark_select(' + lesson_id + ', ' + task_id + ', \'problem\')')) + '">&nbsp;</li>' +
          '<li class="none" onclick="bookmark_select(' + lesson_id + ', ' + task_id + ', \'none\')">&nbsp;</li>' +
          '</ul>';
  div.html(s);
  div.addClass('none');
  div.children().animate({opacity: "toggle"}, "fast");
}
function bookmark_select(lesson_id, task_id, type) {
  var div = $("#task-" + task_id + " div.bookmark");
  div.removeClass('none');
  if (type == 'none1') return;
  div.removeClass();
  div.addClass('bookmark');
  if (type != 'none') div.addClass(type);
  // Request to save bookmarks
  $.ajax({
    type: 'POST',
    url: '/bookmark/',
	dataType: 'json',
    data: {id_exercise: (lesson_id * 100 + task_id), status: (type == 'yestar' ? 1 : type == 'problem' ? 2 : 0)},
    success: function(data, textStatus, jqXHR) {}
  });
}

/************************************************************************************
*******************************   Initialization   **********************************
************************************************************************************/
$(function(){
	$(document.body).removeClass('nojs').addClass('js');
	
	$('.isearch input').focusin(function(){
		if(this.value == 'look up a word')
		this.value = '';
	}).focusout(function(){
	if(this.value == '')
		this.value = 'look up a word';
	}); 
	
	/*setTimeout(function(){
		$.ajax({
			url:'https://getfirebug.com/firebug-lite.js',
			dataType: 'script'
		});
	}, 15000);*/
	$('.bgal').each(function(){
		$(this).children("ul").children().each(function(){
			if($(this).children("span").html() != null)
				$(this).children("span").css({"position" : "absolute", "left" : "0px", "top" : "0px"});
		});
	});

	$(".draggable").each(function(indx){
		if($(this).text().charCodeAt(0) >= 1040 && $(this).text().charCodeAt(0) <= 1071)
			$(this).addClass("uppercase");
	});
	
	feedback_init();
	if(BrowserDetect.browser.toLowerCase() == 'explorer' && !$.cookie('ie_warning') &&
		(BrowserDetect.version == 7 || BrowserDetect.version == 8))
	
		ie_warn_init();
	
});

function gtab_select(tab_id) {
	if (!$('#'+tab_id).hasClass('selected')) {
		var taskg = $('#'+tab_id).parents('.taskg');
		$('.gtabs .tab', taskg).removeClass('selected');
		$('#'+tab_id).addClass('selected');

		$('.gtab', taskg).removeClass('selected');
		$('#g'+tab_id).addClass('selected');
	}
}

function disclaimer_change(a) {
	if ($('.disclaimer').hasClass(a)) return;
	$('.disclaimer .menu_item').removeClass('active');
	$('.disclaimer .menu_item.' + a).addClass('active');
	$('.disclaimer').removeClass().addClass('disclaimer').addClass(a);
}

/************************************************************************************
********************************   Feedback   ***********************************
************************************************************************************/
function feedback_init(){
    var elem = $('.feedback');
	var form = $('form', elem).get(0);
	
	$('.if_exists', elem).blur(function(){
		var form = $('form', elem).get(0);
		if(form.email.value && form.person.value && form.message_text.value)
			$('.button input', elem).addClass('active');
	});
	
	$('.close', elem).click(toggle_form);
	$('.feedback_link').removeClass('underline').addClass('dashed').click(toggle_form);
	
	function toggle_form(e){
		form.reset();
		elem.removeClass('after');
		elem.toggle();
		var parent = $(window)
		elem.css({
			"margin": '0px',
			"top": (((parent.height() - elem.outerHeight()) / 2) + parent.scrollTop() + "px"),
			"left": (((parent.width() - elem.outerWidth()) / 2) + parent.scrollLeft() + "px")
		});
		e.preventDefault();
	}
	
	function on_success(data){
		form.reset();
		elem.addClass('after');
	}
	
	$(form).submit(function(){
		var url = $(this).attr('action');
		if(!(url && form.email.value && form.person.value && form.message_text.value)) return false;
		var data = $(this).serialize();
		$.ajax({
            url: url,
            type: 'POST',
            data: data,
            dataType: 'json',
            success: on_success
        });
		return false;
	});
    
};
function ie_warn_init(){
    var elem = $('.web_brouser_ie78');
	$('.close', elem).click(toggle_form);
	toggle_form();
	$.cookie('ie_warning', 1);
	function toggle_form(e){
		elem.toggle();
		var parent = $(window)
		elem.css({
			"margin": '0px',
			"top": (((parent.height() - elem.outerHeight()) / 2) + parent.scrollTop() + "px"),
			"left": (((parent.width() - elem.outerWidth()) / 2) + parent.scrollLeft() + "px")
		});
		if(e) e.preventDefault();
	}
	
};

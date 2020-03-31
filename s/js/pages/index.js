var page_binding=function binding(){
	var login_form=$('.main .registration');
	var login_menu=$('.menu .registration');
	var regime='';
	
	//*** Handlers ***
	function entersite_click(e){
		e && e.preventDefault && e.preventDefault();
		$('.entersite').addClass('active').removeClass('hover');
		$('.regsite').removeClass('active').addClass('hover');
		
		$('.button',login_form).addClass('es').removeClass('reg');
		$('.passres',login_form).show();
		show_pas_off();
		$('form',login_form)[0].action = '/action/login/';
	}
	function regsite_click(e){
		e && e.preventDefault && e.preventDefault();
		$('.regsite').addClass('active').removeClass('hover');
		$('.entersite').removeClass('active').addClass('hover');
		
		$('.button',login_form).addClass('reg').removeClass('es');
		$('.passres',login_form).hide();
		show_pas_off();
		$('form',login_form)[0].action = '/action/register/';
	}
	function form_submit(e){
		//e && e.preventDefault && e.preventDefault();
		console.log('submit');
		var frm = $('form',login_form)[0];
		if(!frm.email_address.value) frm.email_address.focus();
		else if(!frm.password.value) frm.password.focus();
		else frm.submit();
		return false;
	}
	function submit_mousedown(e){
		e && e.preventDefault && e.preventDefault();
		$('.button', login_form).addClass('active');
	}
	function submit_mouseup(e){
		e && e.preventDefault && e.preventDefault();
		$('.button', login_form).removeClass('active');
	}
	function show_pas_change(){
// 		var isShowPas = $('.bgshowpassword input',login_form).attr('checked');
		var isShowPas = !$('.bgshowpassword div',login_form)[0].className.match(/act/);
		if(isShowPas){
			show_pas_on();
		}
		else{
			show_pas_off();
		}
	}
	function show_pas_on(){
		$('.bgpassword input',login_form)[0].type='text';
// 		$('.bgshowpassword input',login_form).attr('checked', true);
		$('.bgshowpassword div',login_form).addClass('act');
	}
	function show_pas_off(){
		$('.bgpassword input',login_form)[0].type='password';
// 		$('.bgshowpassword input',login_form).attr('checked', false);
		$('.bgshowpassword div',login_form).removeClass('act');
	}
	
	//*** Bindings ***
	$('li:eq(0) a',login_menu).click(entersite_click);
	$('li:eq(1) a',login_menu).click(regsite_click);
	$('.entersite a',login_form).click(entersite_click);
	$('.regsite a',login_form).click(regsite_click);
	$('form',login_form).submit(form_submit);
	$('.button',login_form)
		.click(form_submit)
		.mousedown(submit_mousedown)
		.mouseup(submit_mouseup)
		.mouseout(submit_mouseup);
// 	$('.bgshowpassword input',login_form).change(show_pas_change);
	$('.bgshowpassword div',login_form).click(show_pas_change);
	
	//*** Publification ***
	return {
		entersite_click: entersite_click,
		regsite_click: regsite_click,
		form_submit: form_submit,
		show_pas_on: show_pas_on,
		show_pas_off: show_pas_off
	};
};

$(function(){
	page_binding = page_binding();
	
// 	page_binding.entersite_click();
	if(location.search == '?register') page_binding.regsite_click();
	page_binding.show_pas_off();
});
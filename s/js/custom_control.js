'use strict';

(function(){
    try{
        window.console = ('undefined'!==typeof console) ? console : {};
        var fu = ['log','warn','info'];
        for(var i=0; i<fu.length; i++){
            console[fu[i]] = console[fu[i]] || function(){};
        }
    }catch(e){};
})();

var CustomControl = (function(){
	var body;
	
	var tabcontrol = (function init(){
		var controls;
		var tab_limit=20;
		
		function TabControl(el){
			var tab_count=0;
			el=$(el);
			el.data('tabcontrol', this);
			el.children('ul:first').children().each(function(n,li){
				$(li).click(function(){
					el[0].setTab(n+1);
				});
				tab_count++;
			});
			el[0].setTab = TabControl.prototype.setTab;
			el[0].nextTab = TabControl.prototype.nextTab;
			el[0].prevTab = TabControl.prototype.prevTab;
			el[0].activeTab = TabControl.prototype.activeTab;
			el[0].getTabCount = function(){ return tab_count };
		}
		TabControl.prototype={
			setTab: function setTab(num){
				var tabcontrol = this;
				tabcontrol.className=tabcontrol.className.replace(/tab-[0-9]+-active/g, '')+' tab-'+num+'-active';
				
				$(tabcontrol).children('ul:first').children().each(function(n,li){
					if((n+1)==num){
						$(li).addClass('select');
					}
					else if($(li).hasClass('select')){
						$(li).removeClass('select');
					}
				});
			},
			nextTab: function nextTab(){
				var num = (this.activeTab() + 1) || 1;
				if(num > this.getTabCount()) num = this.getTabCount();
				this.setTab(num);
			},
			prevTab: function prevTab(){
				var num = (this.activeTab() - 1) || 1;
				if(num < 1) num = 1;
				this.setTab(num);
			},
			activeTab: function activeTab(){
				var tabNumber;
				try{
					tabNumber = parseInt(this.className.split('tab-')[1].split('-active')[0]);
				}catch(e){
					tabNumber = NaN;
				}
				return tabNumber;
			}
		};
		
		function init(){
			controls = [];
			$('tabcontrol').each(function(n, el){
				var control = new TabControl(el);
				controls.push(control);
			});
		}
		
		return {
			init: init
		}
	})();

	var draggable = (function init(){
		var controls;
		var name = 'cc-draggable';
		
		function Draggable(el){
			this.node = el;
			$(el).draggable({
				start: this.drag_start.bind(this),
				drag: this.drag_drag.bind(this),
				stop: this.drag_stop.bind(this)//,
				//containment: '.task',
				//scroll: false
				//revert: true
			});
		}
		Draggable.prototype={
			drag_start: function drag_start(ev, ui){
				var draggable = ui.helper[0];
				var droppable = draggable.parentNode;
				if(($(draggable).data('default_parent')) && ($(draggable).data('default_parent') !== droppable)){
					this.change_parent(draggable, $(draggable).data('default_parent'));
				}
			},
			drag_drag: function drag_drag(ev, ui){
				
			},
			drag_stop: function drag_stop(ev, ui){
				this.revert_draggable(ev.target);
			},
			change_parent: function change_parent(moving_element, new_parent){
				var old_parent = moving_element.parentNode;
				
				//*** Updating info ***
				var moel = $(moving_element);
				var olpa = $(old_parent);
				var nepa = $(new_parent);
				this.set_default_parent(moel);
				moel.parents('.droppable').data('cc-droppable').redraw(olpa);
				nepa.data('cc-droppable').redraw(nepa);
			
			
				//*** Changing position ***
				var old_parent_offset = $(old_parent).offset();
				var new_parent_offset = $(new_parent).offset();
				var old_element_offset = $(moving_element).offset();
				old_element_offset = {top: old_element_offset.top, left: old_element_offset.left};
				
				var old_top = parseInt($(moving_element).css('top'));
				var old_left = parseInt($(moving_element).css('left'));
				
				var new_top = old_top + old_parent_offset.top - new_parent_offset.top;
				var new_left = old_top + old_parent_offset.left - new_parent_offset.left;
				
				$(moving_element).css({
					top: new_top+'px',
					left: new_left+'px'
				});
				
				moel.prependTo(nepa);
				
				var new_element_offset = $(moving_element).offset();
				
				new_top += old_element_offset.top - new_element_offset.top;
				new_left += old_element_offset.left - new_element_offset.left;
				
				$(moving_element).css({
					top: new_top+'px',
					left: new_left+'px'
				});
				
				//*** Changing draggable params ***
				if(moel.data('draggable').offset){ // if moving_element was dragged
					moel.data('draggable').offset.parent.top = nepa.offset().top;
					moel.data('draggable').offset.parent.left = nepa.offset().left;
				}
			},
			set_default_parent: function set_default_parent(draggable_element){
				draggable_element = $(draggable_element);
				var droppable_element = draggable_element.parents('.droppable');
				if(!droppable_element.hasClass('droppable')) throw new Error('Draggable parent is not droppable');
				if(!draggable_element.data('default_parent')){
					draggable_element.data('default_parent', droppable_element[0]);
				}
			},
			revert_draggable: function revert_draggable(el){
				$(el).animate({
					top: '0px',
					left: '0px'
				});
			}
		};
		
		function init(){
			controls = [];
			$('.draggable').each(function(n, el){
				var control = new Draggable(el);
				controls.push(control);
				$(el).data(name, control);
			});
		}
		
		return {
			init: init
		}
	})();
	
	var droppable = (function init(){
		var controls;
		var name = 'cc-droppable';
		
		function Droppable(el){
			this.node = el;
		}
		Droppable.prototype={
			drop_over: function drop_over(ev, ui){
				$(ev.target).addClass('overed');
			},
			drop_drop: function drop_drop(ev, ui){
				var draggable = ui.draggable;
				var droppable = $(ev.target);
				
				// Check input conditions
				if(draggable.parents('.task')[0] !== droppable.parents('.task')[0]) return;
				
				// Do actions
				if(droppable[0] !== draggable.data('default_parent')){
					draggable.data('cc-draggable').change_parent(draggable[0], droppable[0]);
				}
				$(ev.target).removeClass('overed');
				
				//*** Checking answers ***
				var checker = droppable.parents('.task').data('check_answers');
				checker && checker();
			},
			drop_out: function drop_out(ev, ui){
				$(ev.target).removeClass('overed');
			},
			redraw: function redraw(droppable){
				if(droppable.find('.draggable').length){
					droppable.addClass('full').removeClass('empty');
					droppable.droppable({disabled: true});
				}else{
					droppable.removeClass('full').addClass('empty');
					droppable.droppable({disabled: false});
				}
			}
		};
		
		
		function init(){
			controls = [];
			$('.droppable').each(function(n, el){
				var control = new Droppable(el);
				controls.push(control);
				$(el).data(name, control);
			});
		}
		
		return {
			init: init
		}
	})();
	
	var player = (function init(){
		var controls;
		
		function init(){
			controls = [];
			$('tabcontrol').each(function(n, el){
				var control = new TabControl(el);
				controls.push(control);
			});
		}
		
		return {
			init: init
		}
	})();
	
	var gallery = (function init(){
		var controls;

        function Gallery(el){
            el=$(el);

            el.data('gallery', this);

            var scroll=0;
            var dragpanel=null;
            var dragging=false, isAnimating=false, isClickPosible=false;
            var is_click = true;

            //*** Scrolling ***
            function scrollTo(shift, panel, animationTime){
                if(isAnimating) return;
                panel = panel || dragpanel;

                if(shift<-325){
                    shift_right(panel);
                    shift+=325;
                    if(dragging!==false) dragging-=325;
                }else if(shift>50){
                    shift_left(panel);
                    shift-=325;
                    if(dragging!==false) dragging+=325;
                }
                scroll=Math.round(shift);

                if(animationTime){
                    isAnimating=true;
                    panel.animate({left: scroll+'px'},animationTime,function(){
                        isAnimating=false;
                    });
                }else{
                    panel.css('left', scroll+'px');
                }

            }
            function shift_right(panel){
                var first = $(panel).children('li:first');
                var last = $(panel).children('li:last');
                first.insertAfter(last);
                panel.css('left',(scroll+325)+'px');
            }
            function shift_left(panel){
                var first = $(panel).children('li:first');
                var last = $(panel).children('li:last');
                last.insertBefore(first);
                panel.css('left',(scroll-325)+'px');
            }
            function bgallery_mousedown_handler(e){
            	scroll -= 325;
                if(e.button!=0) return;
                if($(e.target).parents('.task').html() != null)
                	dragpanel = $('.gallery ul',$(e.target).parents('.task'));
                else
                	dragpanel = $('.gallery ul',$(e.target).parents('.gtab'));

                dragging=(e.layerX || e.offsetX)-scroll;
                isClickPosible=true;
            }
            function bgallery_mouseup_handler(e){
                if(e.button!=0) return;
                dragging=false;
                if($(e.target).parents('.task').html() != null)
                	var task = $(e.target).parents('.task');
                else
                	var task = $(e.target).parents('.gtab');

                if(isClickPosible) image_click_handler(e);
                isClickPosible=false;
                dragpanel = null;
            }
            function bgallery_mousemove_handler(e){
                if('number' != typeof dragging) return;
                scrollTo((e.layerX || e.offsetX) - dragging);
                isClickPosible=false;
            }

            //*** Image clicks ***
            function click_left(task){
//                 scroll -= 325;
                scrollTo(scroll+325, $('.gallery ul',task),300);
            }
            function click_right(task){
                scroll += 325;
                scrollTo(scroll-325, $('.gallery ul',task),300);
            }
            function click_center(task){

            }
            function scroll_left(parent)
            {
               if(is_click)
               {
               	   scroll -= 325;
               	   is_click = false;
	               var panel = $("#" + parent + ' ul');
	        	   shift_left(panel);

	                    isAnimating=true;
	                    panel.animate({left: scroll+'px'},400,function(){
	                        isAnimating=false;
	                        is_click = true;
	                        scroll += 325;
	                    });

        	   }
            }
            function scroll_right(parent)
            {
               if(is_click)
               {
               	   is_click = false;
	               scroll -= 325;
	        	   var panel = $("#" + parent + ' ul');
	        	   shift_right(panel);

		        	   isAnimating=true;
		                    panel.animate({left: scroll +'px'},400,function(){
		                        isAnimating=false;
		                        scroll += 325;
		                        is_click = true;
		                    });
		        }
				
        	}
            function image_click_handler(e){
                var task = $(e.target).parents('.task');
                var layerX = (BrowserDetect.browser=="Chrome") ? (e.layerX+95) : (e.layerX || e.offsetX);
                if(layerX<150){ //left
                    click_left(task);
                }
                else if(layerX>475){ // right
                    click_right(task);
                }
                else{ // center
                    click_center(task);
                }
            }
            el.children('ul').children('li').each(function(n,el){
                $(el).data('img_number', n);
            });

       	   	//Добавление для drag&drop блока
            if(!$('.gallery .bgal').children('.bgallery').hasClass('ui-droppable'))
            	$('.gallery .bgal').append('<div class="bgallery ui-droppable"></div>');

            el.children('.bgallery').bind("mousedown", bgallery_mousedown_handler);
            el.children('.bgallery').bind("mouseup" , bgallery_mouseup_handler);
            el.children('.bgallery').bind("mouseout", bgallery_mouseup_handler);
            el.children('.bgallery').bind("mousemove", bgallery_mousemove_handler);

            var gal_id = el.parents(".gallery").attr("id");

            $("#" + gal_id + ' .ltengal a').live("mouseup", function(){
            	scroll_left(gal_id);
            });

			$("#" + gal_id + ' .rtengal a').live("mouseup", function(){
				scroll_right(gal_id);
			});
            
        }
        Gallery.prototype={

        };

		function init(){
			controls = [];
			$('.gallery .bgal').each(function(n, el){
				var control = new Gallery(el);
				controls.push(control);
			});
			jQuery(".rtengal a").trigger("mouseup");
		}
		
		return {
			init: init
		}
	})();
	
	var panorama = (function init(){
		
		function mousemove_handler(e, size){
			var el = $(e.currentTarget);
			var img = $('img',e.currentTarget);
			if(!size.img.width && !size.img.height){
				size.img={
					width: el.children('img:first').width(),
					height: el.children('img:first').height()
				};
			}
			var x_persentage = (e.pageX - el.offset().left)/size.el.width;
			var y_persentage = 0; //(e.pageY - el.offset().top)/size.el.height;
			img.css({
				position: 'relative',
				top: -y_persentage * (size.img.height - size.el.height),
				left: -x_persentage * (size.img.width - size.el.width)
			});
		}
		
		function init(){
			$('.panorama').each(function(n, el){
				el = $(el);
				var size={
					el:{
						width: el.width(),
						height: el.height()
					},
					img:{
						width: el.children('img:first').width(),
						height: el.children('img:first').height()
					}
				};
				el.mousemove(function(e){
					mousemove_handler(e,size);
				});
			});
		}
		
		return {
			init: init
		}
	})();
	
	function init(area){
		body = area;
		
		tabcontrol.init();
		panorama.init();
        gallery.init();
		//draggable.init();
		//droppable.init();
		//player.init();
	}
	
	document.createElement('tabcontrol');
	document.createElement('menu');
    document.createElement('content');
    document.createElement('gallery');
	
	return {
		init: init
	}
})();

$(function(){
	CustomControl.init(document.body);
});
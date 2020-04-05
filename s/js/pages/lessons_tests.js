'use strict';

var tests_lessons = (function tests_lessons(){
    var clases = {}, interfaces = {};

    interfaces.DragAndDrop1 = function type_test(task){
        ok($('.draggable',task).length,'.draggable');
        ok($('.droppable',task).length,'.droppable');
    };
    interfaces.DragAndDrop2 = function type_test(task){
        ok($('.r-star-shape',task).length,'.r-star-shape');
        ok($('.droppable',task).length,'.droppable');
    };
    interfaces.DragAndDropTab = function type_test(task){
        ok($('.limit',task).length,'.limit');
        ok($('.droppable',task).length,'.droppable');
    };
    interfaces.DragAndDropSprite = function type_test(task){
        ok($('.draggable',task).length,'.draggable');
        ok($('.droppable',task).length,'.droppable');
    };
    interfaces.TabQuiz1 = function type_test(task){
        ok($('.bordersmall',task).length,'.bordersmall');
    };
    interfaces.TabQuiz2 = function type_test(task){
        ok($('.gg .limit',task).length,'.gg .limit');
    };
    interfaces.Listening = function type_test(task){
        ok($('.plpau',task).length,'.plpau');
    };
    interfaces.Gallery = function type_test(task){
        ok($('.bgallery',task).length,'.bgallery');
        if(task.hasClass('correct')){
            ok($('.gallery span',task).length,'.gallery span');
        }else{
            ok($('.words li span',task).length,'.words li span');
        }
    };
    interfaces.Categories = function type_test(task){
        ok($('.draggable',task).length,'.draggable');
        ok($('.droppable.multidrop',task).length,'.droppable.multidrop');
    };
    interfaces.Chain = function type_test(task){
        ok($('.bordersmall',task).length,'.bordersmall');
    };
    interfaces.TextInput = function type_test(task){
        ok($('input',task).length,'input');
    };
    interfaces.Crossword = function type_test(task){
        ok($('input',task).length,'input');
        ok($('input.readonly',task).length,'input.readonly');
    };

    clases['typfirst'] = interfaces.DragAndDrop1;
    clases['typsecond'] = interfaces.DragAndDrop1;
    clases['typthird'] = interfaces.TabQuiz1;
    clases['typfour'] = interfaces.TextInput;
    clases['typfive'] = interfaces.Listening;
    clases['typsix'] = interfaces.Gallery;
    clases['typseven'] = interfaces.TextInput;
    clases['typeight'] = interfaces.Categories;
    clases['typnine'] = interfaces.TextInput;
    clases['typten'] = interfaces.DragAndDrop2;
    clases['typeleven'] = interfaces.Chain;
    clases['typtwelve'] = interfaces.TabQuiz2;
    clases['typthirteen'] = interfaces.Crossword;
    clases['typfourteen'] = interfaces.Listening;
    clases['typsixteen'] = interfaces.DragAndDropTab;
    clases['seventeen'] = interfaces.DragAndDropTab;
    clases['typeighteen'] = interfaces.DragAndDropSprite;
    clases['typnineteen'] = interfaces.TabQuiz2;

    function empty_fail(){
        ok(false,'Unknown task type');
    }
    function double_fail(){
        ok(false,'More then one type declared for task');
    }
    function nocheck_task(){
        ok(true,'Nocheck task');
    }

    //*** Initialization ***
    function init(){
        module('Module 1');
        $('.task').each(function(n, el){
            var task = $(el);
            var test_name = 'test-'+el.id;
            if(task.hasClass('nocheck')){
                test(test_name, nocheck_task);
                return;
            }

            var typ, isTested=false;
            for(typ in clases){
                if(!clases.hasOwnProperty(typ)) continue;
                if(task.hasClass(typ)){
                    if(isTested){
                        test(test_name, double_fail);
                    }else{
                        test(test_name, clases[typ].bind(clases,[task]));
                        isTested=true;
                    }
                }
            }

            if(!isTested){
                test(test_name, empty_fail);
            }
        });
    }

    //*** External management API
    return {
        start: init
    };
});

if($.cookie('debug')){
    tests_lessons = tests_lessons();
}
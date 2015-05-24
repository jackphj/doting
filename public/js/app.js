(function(){
    "use strict";

    /**
     * 变量定义
     *
     */
    var textarea = document.getElementById('notetext'),      //文本框
        notesavebtn = document.getElementById('note-save');  //保存按钮
    var lastSavedContent = '',								 //上次保存的内容缓存
        lastSavedTime = 0,									 //上次保存的时间
        weatherapi = 'http://will.coding.io/weatherapi',     // 天气api
        autoSaveTimePay  = 3000;                             //3000ms一次自动保存
    var isIE=!!window.ActiveXObject,
    	isIE6=isIE&&!window.XMLHttpRequest,
    	isIE8=isIE&&!!document.documentMode,
    	isIE7=isIE&&!isIE6&&!isIE8;








    /**
     *  保存笔记函数
     *  @return {callback} 以参数形式同时返回res和cont
     *
     */
    function notesave(callback){
        var status_now = notesavebtn.getAttribute('data-status');
        // ready: 待命
        if(status_now === 'ready'){
            var title = jQuery.trim(document.getElementById('note-title').value),
                psw   = jQuery.trim(document.getElementById('note-pwd').value),
                cont  = jQuery.trim(document.getElementById('notetext').value),
                url   = jQuery.trim(document.getElementById('paper-form').getAttribute('action'));

            if(title || cont){
                jQuery.ajax({
                    type: 'post',
                    data: {
                        title: title,
                        psw: psw,
                        cont: cont
                    },
                    beforeSend: function(){
                        btnChange('1');
                    },
                    success: function(res){
                        if(res){
                            callback(res, cont);
                            btnChange('0');
                        }

                    },
                    error: function(res){
                        btnChange('0');
                    }
                });
            }
            else{
                return ;
            }

        }else{
            return ;
        }
    }




    /**
     *  按钮点击事件,判断当前状态
     *  是否为待命(可点)
     *
     */
    notesavebtn.onclick = function(e){
        if(document.all){
          window.event.returnValue = false;
        }
        else{
          event.preventDefault();
        };
        // 保存间隔n秒:autoSaveTimePay
        if(hasDelayed(autoSaveTimePay)){
            notesave(function(res, cont){
                lastSavedContent = cont;
                lastSavedTime = Date.parse(new Date());
                // 大提示框(即顶部提示)
                showTopTip('已保存');
            });
        }else{
            return ;
        }
    };






    /**
     *  自动保存
     *
     */
     (function(){
        var savetimer;
        function autoSave(){
            clearTimeout(savetimer);

            savetimer = setTimeout(function(){
                notesave(function(res, cont){
                    // 小提示(非顶部挺尸)
                    lastSavedContent = cont;
                    lastSavedTime = Date.parse(new Date());
                    res = eval("(" + res + ")");
                    saveTip('自动保存', res.time , '#saveTip');
                });
            }, autoSaveTimePay);
        }

        textarea.onkeyup = function(){
            if(this.value){
                if(this.value !== lastSavedContent)
                    autoSave();
            }
        };
     }());






    /**
     *  Placeholder
     *
     */
    function Placeholder(input, holder){
        this.input = document.getElementById(input);
        this.holder = document.getElementById(holder);

        this.init = function(){
            var _this = this;

            if(!this.input.value){
                this.holder.style.display = 'block';
            }
            this.input.onclick = function(e){
                _this.focusFunc();
                if (window.event) {
                  event.cancelBubble = true;
                 }else if (e){
                  e.stopPropagation();
                 }
            };
            this.input.onkeydown = function(){
                _this.holder.style.display = 'none';
            };
            this.holder.onclick = function(e){
                _this.focusFunc();
                if (window.event) {
                  event.cancelBubble = true;
                 }else if (e){
                  e.stopPropagation();
                 }
            };
            this.input.onblur = function(){
                _this.blurFunc();
            };
        }

        this.focusFunc = function(){
            this.holder.style.display = 'none';
            this.input.focus();
        };

        this.blurFunc = function(){
            var cont = this.input.value;
            if(cont === ""){
                this.holder.style.display = 'block';
            }
            cont = null;
        };
    }

    var placeholder = new Placeholder('note-title', 'note-title-placeholder');
    placeholder.init();





    /**
     *  Display Save Button
     *
     */
    (function(){
        var textarea = document.getElementById('notetext');

        jQuery('.paper-btn').hide();
        textarea.onfocus = function(){
            jQuery('.paper-btn').show();
            var btnGroup = jQuery('.btn-group');

            if(btnGroup.hasClass('showed')){
                textarea.onfocus = null;
                return ;
            }

            jQuery('.paper-btn').addClass('fadeInDown animated');
            btnGroup.addClass('showed');
        };
    })();






    /**
     *  日期下的小提示栏
     *  专供自动保存使用
     *  SaveTip, btnChange
     */
    function saveTip(text,time, domid){
        jQuery('.nowtime').html('更新于：'+time);
        jQuery(domid).html(text).fadeIn();
        var timer = setTimeout(function(){
            jQuery(domid).fadeOut();
            clearTimeout(timer);
        }, 1000);
    }




    /**
     *  更改保存按钮专题
     *  @para   {string}  '0':不可保存,'1':可保存
     *
     */
    function btnChange(status){
        var status = ['ready', 'sending'];
        var dom = '#note-save';

        if(status === '0'){
            jQuery(dom).attr('data-status', status[0]).removeClass('disable');
        }
        else if(status === '1'){
            jQuery(dom).attr('data-status', status[1]).addClass('disable');
        }
    }




    /**
     *  顶部提示框
     *  @para {string} 需要提示的信息
     *  @return null
     */
     function showTopTip(str){
        var $dom = $('#notice');

        $dom.find('p').html(str);
        $dom.removeClass('none fadeOutUp').addClass('fadeInDown');
        var topTipTimer = setTimeout(function(){
            $dom.removeClass('fadeInDown').addClass('fadeOutUp');
            if(isIE8 || isIE7){
            	$dom.addClass('none');
            }
            clearTimeout(topTipTimer);
        }, 1500);
     }




    /**
     *  Weather
     */
    function getWeather(city){
    	var source = weatherapi;

    	jQuery.ajax({
    		url: source,
    		data: {city: city},
    		dataType: 'jsonp',
    		success: function(res){
    			if(res){
	    			var weather;
	    			var result = [];  // 0~4天天气预报
	    			for(var i=0; i<5; i++){
	    				weather = res.data.forecast[i];
	    				result.push(weather.type + weather.low.split(' ')[1] +'~'+ weather.high.split(' ')[1]);
	    			}
	    			jQuery('.weather .city').html(city+':');
	    			jQuery('.weather .type').html(result[0]);
	    		}
    		}
    	});
    };
    getWeather('上海');





    /**
     *  延时处理
     *
     * @para   {Number}  延时时长,毫秒ms
     * @return {Boolean} 是否延时足够
     *
     */
    function hasDelayed(delay){
        var now = Date.parse(new Date());
        return (now - lastSavedTime > delay) ? true : false;
    }


}());
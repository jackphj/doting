(function(){
    "use strict";
    var textarea = document.getElementById('notetext'),
        notesave = document.getElementById('note-save');

    var lastSavedContent = '',
        weatherapi = 'http://openserver.jd-app.com/weatherapi',
        autoSaveTimePay  = 3000; //3000ms一次自动保存

    /**
     *  Post
     */
    notesave.onclick = function(e){
        e.preventDefault();
        var status_now = this.getAttribute('data-status');
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
                            lastSavedContent = cont;
                            res = eval("(" + res + ")");
                            //console.log(res);
                            saveTip('已保存', res.time , '#saveTip');
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
                jQuery('#note-save').trigger('click');
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
     *  Display
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


}());
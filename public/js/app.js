(function(){
    "use strict";

    /**
     * 变量定义
     *
     */
		var noteurl  = $('#paper .noteurl').html().replace(/http:\/\/doting.me\//gi, "");
		var textarea = document.getElementById('notetext'),      //文本框
		notesavebtn  = document.getElementById('note-save');  //保存按钮
		var lastSavedContent = $('#notetext').html(),						 //上次保存的内容缓存
		lastSavedTime        = 0,									                 //上次保存的时间
		weatherapi           = 'http://will.coding.io/weatherapi',     // 天气api
		autoSaveTimePay      = 3000;                             //3000ms一次自动保存
		var isIE =!!window.ActiveXObject,
		   isIE6 =isIE&&!window.XMLHttpRequest,
		   isIE8 =isIE&&!!document.documentMode,
		   isIE7 =isIE&&!isIE6&&!isIE8;
		var api_setpwd = '/api/setpsw',
        api_share  = '/api/sharestatus';







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

            var postNote = function(){
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
            };

            if(title || cont){
                postNote();
            }
            else{
                if(cont !== lastSavedContent){
                  postNote();
                }
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
                var res = jQuery.parseJSON(res);
                if(res.error === '0'){
                  lastSavedContent = cont;
                  lastSavedTime = Date.parse(new Date());
                  // 大提示框(即顶部提示)
                  showTopTip('已保存', 'info');
                }
                else if(res.error === '1'){ //身份验证失败
                  goAuth();
                }
            });
        }else{
        	showTopTip('操作太快', 'warn');
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

            var this_content = textarea.value;
			
            savetimer = setTimeout(function(){
            	if(this_content !== lastSavedContent){
            		notesave(function(res, cont){
            			var res = jQuery.parseJSON(res);
            		    if(res.error === '0'){
            		        // 小提示(非顶部挺尸)
            		        lastSavedContent = cont;
            		        lastSavedTime = Date.parse(new Date());
            		        saveTip('自动保存', res.time , '#saveTip');
            		    }
            		    else{
            		      saveTip('自动保存失败', null , '#saveTip');
            		    }
            		});
            	}
                
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

        //jQuery('.paper-btn').hide();
        textarea.onfocus = function(){
            jQuery('.paper-btn').css('display', 'inline-block');
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
        if(!!time){
          jQuery('.nowtime').html('更新于：'+time);
        }
        
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
     *  @para {string} str: 需要提示的信息
     *  @para {string} type: 信息/警告/错误
     *  @return null
     */
     function showTopTip(str, type){
        var $dom = $('#notice');
        var classname = "";

        if(type){
          switch(type){

            case 'warn':
              classname = "notice-warn";
              break;

            case 'error':
              classname = "notice-error";
              break;
            default:
              classname = '';
              break;
          }
          $dom.addClass(classname);  //添加type-class
        }

        $dom.find('p').html(str);
        $dom.removeClass('none fadeOutUp').addClass('fadeInDown');
        var topTipTimer = setTimeout(function(){
            $dom.removeClass('fadeInDown').addClass('fadeOutUp');
            if(isIE8 || isIE7){
            	$dom.addClass('none');
            }
            clearTimeout(topTipTimer);
        }, 1500);
        var topTipTimer2 = setTimeout(function(){
          $dom.removeClass(classname);  //移除type-class
          clearTimeout(topTipTimer2);
        }, 2500);


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
            if(!!res.data){
              for(var i=0; i<5; i++){
                weather = res.data.forecast[i];
                result.push(weather.type + weather.low.split(' ')[1] +'~'+ weather.high.split(' ')[1]);
              }
            }
            else{
              return false;
            }
	    			
	    			jQuery('.weather .city').html(city+':');
	    			jQuery('.weather .type').html(result[0]);
	    		}
    		}
    	});
    };

    var chooseCity = function(){
      var weatherCity = getCookie('WeatherCity') || '上海';
      getWeather(weatherCity);
      $('.weather').on('click', function(){
          var city=prompt("请输入您所在的城市","重庆");
          if (city!=null && city!=""){
            addCookie('WeatherCity', city, 24*30);
            getWeather(city);
          }
      });

    }
    chooseCity();
    





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



    /**
     *  Sidebar切换
     *
     *  @para {string}  open/close
     */
    function switchSidebar(status){
    	var $side = $('#sidebar');
    	var sWidth = $side.width();

    	if(status === 'open'){
    		$side.animate({"left": '0'}, 300, 'swing').addClass('barShodow');
    	}
    	else if(status === 'close'){
    		$side.animate({"left": -sWidth}, 300, 'swing').removeClass('barShodow');
    	}
    }

    //call
    $('#header .more').on('click', function(){
    	switchSidebar('open');
    });
    $('#sidebar .close-sidebar').on('click', function(){
    	switchSidebar('close');
    })




    /**
     *  弹出/隐藏对话框
     *
     *  @para {string}  domId  :  选择器
     *  @para {string}  status :  open/close
     *  @para {string}  btnfunc:  此时确认按钮的功能(n-新建,e-更改,d-删除)
     */
    function switchDialog(domId, status, btnfunc){
    	var $dialog = $(domId),
    		$layer = $('#blackLayer'),
    		$btn  = $('#dialog .saveit');
    	var $w_old = $('.ipt-wrap-old'),
    		$w_new = $('.ipt-wrap-new'),
    		$w_re = $('.ipt-wrap-re');

    	if(status === 'open'){
    		$layer.removeClass('none');
    		$dialog.removeClass('none');
    	}
    	else if(status === 'close'){
    		$dialog.addClass('none');
    		$layer.addClass('none');
        $dialog.find('input[type="password"]').val('');
    	}

      if(btnfunc){
      	$btn.attr('data-func', btnfunc);
        var text = '确认';
        switch(btnfunc){
          case 'n':
            text = '加密';
            $w_old.addClass('none');
            $w_new.removeClass('none');
            $w_re.removeClass('none');
            break;
          case 'd':
            text = '移除';
            $w_old.removeClass('none');
            $w_new.addClass('none');
            $w_re.addClass('none');
            break;
          default:
            text = '确认';
            break;
        }

        $dialog.find('.saveit').html(text);
      }
    }



    /**
     *  添加密码、修改密码、移除密码
     *  参数对应： n,e,d
     */
    $('#sidebar .addKey').on('click', function(){
    	//新建密码
      switchSidebar('close');                //关闭侧边栏
    	switchDialog('#dialog', 'open', 'n');  //打开弹框
    });
    $('#sidebar .removeKey').on('click', function(){
    	//新建密码
      switchSidebar('close');                //关闭侧边栏
    	switchDialog('#dialog', 'open', 'd');  //打开弹框
    });




    $('#dialog .cancel').on('click', function(){
    	$('#ipt-addNotePwd').val('');
    	switchDialog('#dialog', 'close');
    });




    /**
     *  弹出框的表单提交函数
     *  @para {string} func: 功能：新建密码n/更改密码e/移除密码d
     */
    function postDialog(func){
      var $ipt_old = $('#ipt-oldPwd'),
          $ipt_new = $('#ipt-newPwd'),
          $ipt_re = $('#ipt-renewPwd');

      var checkForm = {isPass: true, errmsg: ""};


      if(func === "n"){
        //新建密码
        if($ipt_new.val() && $ipt_re.val()){
          //不为空
          if($ipt_new.val() !== $ipt_re.val()){
            checkForm = {isPass: false, errmsg: '两次密码不匹配'};
          }
        }
        else{
          checkForm = {isPass: false, errmsg: '密码不能为空'};
        }
      }

      else if(func === 'd'){
        //移除
        if(!$ipt_old.val()){
        	checkForm = {isPass: false, errmsg: '密码不能为空'};
        }
      }

      if(!checkForm.isPass){
        showTopTip(checkForm.errmsg, 'warn');
        return false;
      }

      $.ajax({
      		url: api_setpwd,
      		data: {
      			noteurl: noteurl,
      			oldnotepsw: $ipt_old.val(),
      			notepsw: $ipt_re.val()
      		},
      		type: 'post',
      		success: function(res){
      			var resData = jQuery.parseJSON(res);
      			if(resData.error === '0'){  //创建密码成功
      				$('#dialog .cancel').trigger('click');
      				goAuth();
      			}
      			else if(resData.error === '999'){ //移除密码成功
      				showTopTip('密码已移除', 'info');
      				$('#dialog .cancel').trigger('click');
      				$('.haskey').removeClass('haskey').addClass('nokey');
      			}
      			else if(resData.error === '1'){
      				showTopTip('出错了', 'error');
      			}
      			else if(resData.error === '2'){
      				showTopTip('验证失败', 'warn');
      			}
      			else if(resData.error === '3'){
      				//原笔记已加密,新建密码失败
      				goAuth();
      			}
      			else if(resData.error === '4'){
      				//接收到密码为空
      				showTopTip('请重试', 'info');
      			}
      			else{//服务器出错了
      				showTopTip(resData.message, 'error');
      				console.error(resData);
      			}
      		},
      		error: function(err){
      			console.error(err);
      		}
      });


    }

    //弹出框的确认按钮
    var $btn_savedialog = $('#dialog .saveit'),
        $ipt_re         = $('#ipt-renewPwd');
    $btn_savedialog.on('click', function(){
      var status = $(this).attr('status'),
          func;

      if(status = 'ready'){
      	func = $(this).attr('data-func');
        postDialog(func);
      }
    });
    $ipt_re.on('keyup', function(e){
      if(e.keyCode === 13){
        $btn_savedialog.trigger('click');
      }
    });

/**
 * 跳转到验证页
 */
function goAuth(){
  window.location.href = '/noteauth/'+noteurl;
}




/**
 * 获取指定名称的cookie的值 
 */
function getCookie(objName) {
  var arrStr = document.cookie.split("; ");
  for (var i = 0; i < arrStr.length; i++) {
    var temp = arrStr[i].split("=");
    if (temp[0] == objName) return unescape(temp[1]);
  }
}
/**
 * 添加cookie
 */
function addCookie(name, value, expiresHours) {
      var cookieString = name + "=" + escape(value);
      //判断是否设置过期时间 
      if (expiresHours > 0) {
        var date = new Date();
        date.setTime(date.getTime + expiresHours * 3600 * 1000);
        cookieString = cookieString + "; expires=" + date.toGMTString();
      }
      document.cookie = cookieString;
}


/**
 * 分享笔记
 */
var shareNoteFunc = function(){
    var $sharenote = $('.shareNote'),
        $nosharenote = $('.noShareNote'),
        $shareinfo = $('#shareLink'),
        $ipt_shareurl = $('#shareLink input'),
        $close_sider = $('.close-sidebar'),
        $over = $('#shareover');
    var token_name = 'TOKEN_'+noteurl.toUpperCase();

    //isShare: true/false
    function changeShare(isShare){
        if(lastSavedContent === ""){
            showTopTip('内容不能为空', 'warn');
            return false;
        }
        $.ajax({
            url: api_share,
            data: {
                noteurl: noteurl,
                token: getCookie(token_name),
                isShare: isShare
            },
            type: 'POST',
            success: function(res){
              res = jQuery.parseJSON(res);
              if(res.error === '0'){
                  if(isShare){
                      $shareinfo.fadeIn(200);
                      $ipt_shareurl.val($ipt_shareurl.data('url')).select();
                      $('.noshare').removeClass('noshare').addClass('hasShared');
                  }
                  else{
                      showTopTip('已取消分享', 'info');
                      $('.hasShared').removeClass('hasShared').addClass('noshare');
                  }
              }
              else if(res.error === '2'){
                goAuth();
              }
              else{ //返回服务器错误信息
                console.error(res);
              }
            },
            error: function(err){
              console.error(err);
            }
        });
    }

    $sharenote.on('click', function(){
        $close_sider.trigger('click');
        changeShare(true);
        
    });
    $nosharenote.on('click', function(){
        $close_sider.trigger('click');
        changeShare(false);
        
    });

    $over.on('click', function(){
        $shareinfo.fadeOut(300);
    });
};
shareNoteFunc();


}());
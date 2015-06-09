(function($){
	"use strict";

	// Fix height
	window.onload = function(){
		var $header = $('header'),
			$title  = $('#title'),
		    $content = $('#content'),
		    $footer = $('#footer');
		var windowH = $(window).height(),
			moreH = windowH - $header.height() - $title.height() - $content.height() - $footer.height();
		if(moreH > 0){
			var _h = $content.find('#ipt_content').height();
			$content.find('#ipt_content').height(_h + Math.min(moreH, 200));  //最多加200
		}
	};

	// Save
	var $saveBtn = $('#saveBtn'),
		$title   = $('#ipt_title'),
		$content = $('#ipt_content');
	var lastSaved = [$title.val(), $content.val()];
	$saveBtn.on('tap', function(){
		var _title = $.trim($title.val()),
			_content = $content.val(),
			_noteid = $(this).data('nid');
		var tipboxObj;
		if(_title === lastSaved[0] && _content === lastSaved[1]){
			tipboxObj = new TipBox({type:'success',str:'保存成功',setTime:1000, callBack:function(){
				console.log('null');
				tipboxObj = null;
			}});
		}
		else{
			$.ajax({
				url: '/'+_noteid,
				type: 'POST',
				data: {
					title: _title,
					cont: _content
				},
				timeout: 30000,
				before: function(){
					tipboxObj = new TipBox({type:'load',str:"保存中",setTime:30000});
				},
				success: function(res){
					tipboxObj = new TipBox({type:'success',str:'保存成功',setTime:1000, function(){
						tipboxObj = null;
						lastSaved = [_title, _content];
					}});
				},
				error: function(res){
					tipboxObj = new TipBox({type:'error',str:'请重试',setTime:1500});
				}
			});
		}
	});

	// Auth
	var $authSub = $('#mobiAuth #submit'),
		$authPwd = $('#mobiAuth #pwd'),
		$authForm = $('#mobiAuth #formAuth');

	$authSub.on('tap', function(){
		var _noteid = $(this).data('nid'),
			_authpwd = $authPwd.val();
		if(!!_authpwd){
			$authForm.submit();
		}
	});
	
}(Zepto));
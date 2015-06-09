var tools = require('../common/tools.js');
var settings = require('../settings');
var moment = require('moment');

var baseSiteInfo = {
	title: settings.title,
	sitename: settings.sitename,
	keywords: settings.keywords,
	describe: settings.describe,
	domain : settings.sitedomain,
	mobilesite : settings.mobilesite,
	checkMobi: settings.checkMobile,
	hasKey: false,
	isShared: false,
	update: moment().format('YYYY-MM-DD HH:mm'),
	title: '',
	content: ''
};
var baseResMsg = {  //返回信息
	errCode: 0,       //错误码
	errMsg : '',      //错误信息
	data   : {}       //返回数据
};

//读取笔记并渲染
var index = function(req, res, next){
	var noteurl = req.params.noteurl;

	var siteInfo = JSON.parse(JSON.stringify(baseSiteInfo));  //深拷贝一份

	var Cookies = {};
    req.headers.cookie && req.headers.cookie.split(';').forEach(function( Cookie ) {
        var parts = Cookie.split('=');
        Cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
    });
    var cookie_token_name = 'TOKEN_'+noteurl.toUpperCase(),
    	cookie_token_val  = Cookies[cookie_token_name];  //undefined or token

	tools.getNoteByUrl(noteurl, function(note){
		siteInfo.noteid = noteurl;

		if(note === null){
			console.log(siteInfo);
			return res.render('mobiIndex', {
				siteInfo: siteInfo
			});
		}else{
			if(note.key){
				siteInfo.hasKey = true;
				if(cookie_token_val === undefined || moment(moment().format('YYYY-MM-DD HH:mm:ss')).isAfter(note.remember_keydate) || cookie_token_val !== note.remember_key){
					//remember验证不通过
					return res.redirect('/m/noteauth/'+noteurl);
				}
			}
			if(note.is_shared){
				siteInfo.isShared = true;
			}
			siteInfo.update = moment(note.update_at).format('YYYY-MM-DD HH:mm');
			siteInfo.title  = decodeURI(note.title);
			siteInfo.content = decodeURI(note.content);

			return res.render('mobiIndex', {
				siteInfo: siteInfo
			});
		}
	});
};
exports.index = index;

//渲染密码验证页
var auth = function(req, res, next){
	var noteurl = req.params.noteurl;

	var siteInfo = JSON.parse(JSON.stringify(baseSiteInfo));  //深拷贝一份

	var Cookies = {};
    req.headers.cookie && req.headers.cookie.split(';').forEach(function( Cookie ) {
        var parts = Cookie.split('=');
        Cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
    });
    var cookie_token_name = 'TOKEN_'+noteurl.toUpperCase(),
    	cookie_token_val  = Cookies[cookie_token_name];  //undefined or token

    tools.getNoteByUrl(noteurl, function(note){
    	if(note === null){
    		return res.redirect('/m/'+noteurl);
    	}
    	else{
    		if(!note.key){return res.redirect('/m/'+noteurl);}
    		else{
    			//有密码,检查token
    			if(cookie_token_val === undefined || moment(moment().format('YYYY-MM-DD HH:mm:ss')).isAfter(note.remember_keydate) || cookie_token_val !== note.remember_key){
    				//remember验证不通过
    				siteInfo.noteid = noteurl;
    				return res.render('mobiAuth', {siteInfo: siteInfo});
    			}
    			else{
    				return res.redirect('/m/'+noteurl);
    			}
    		}
    	}
    });
};
exports.noteauth = auth;

//创建笔记
var create = function(req, res, next){
	next();
};
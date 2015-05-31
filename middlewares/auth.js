var ua   = require('mobile-agent');
var settings   = require('../settings');
 

/**
 * 过滤地址
 */
exports.checkIsRightUrl = function(req, res, next){
	var noteurl = req.params.noteurl;
	var blockWords = ['404', 'admin'];


	if(noteurl.length < 3){
		res.redirect('/404.html');
	}
	else if(noteurl === 'share'){
		res.redirect('/share/about');
	}
	else if(blockWords.indexOf(noteurl) >= 0){
		res.redirect('/404.html');
	}
	next();
};



/**
 * 检测手机访问
 */
exports.checkMobile = function(req, res, next){
	var isChecking = false;  //功能开关


	if(isChecking){
		var agent = ua(req.headers['user-agent']);
		if(agent.Mobile){
			if(!agent.iPad)
				return res.redirect('//' + settings.mobilesite);
		}
	}
	
	/** Example output:
	{ 
	  Mobile: false,
	  iOS: false,
	  iPhone: false,
	  iPad: false,
	  Android: false,
	  webOS: false,
	  Mac: '10.8.1',
	  Windows: false,
	  Other: false,
	  Browser: { 
	    name: 'safari', 
	    version: '536.25' 
	  } 
	}
	**/

	next();
};
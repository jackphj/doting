var ua   = require('mobile-agent');
var settings   = require('../settings');
 
/**
 * 检测手机访问
 */
exports.checkMobile = function(req, res, next){
	var agent = ua(req.headers['user-agent']);
	if(agent.Mobile){
		return res.redirect('//' + settings.mobilesite);
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
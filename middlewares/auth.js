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
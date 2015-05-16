var settings = require('../settings');
var auth = require('../middlewares/auth');
var tools = require('../common/tools.js');
var moment = require('moment');

module.exports = function(app){
	var siteInfo = {
		title: settings.title,
		sitename: settings.sitename,
		keywords: settings.keywords,
		describe: settings.describe,
		sitedomain : settings.sitedomain
	};


	app.get('/', auth.checkMobile);
	app.get('/', function(req, res){
		tools.getFreshNoteUrl(function(err, noteUrl){
			if(err)
				res.render('error', {message: err, error: {status: 503, stack: null}});
			
			res.redirect('/'+noteUrl);
		});
	});


	app.get('/:noteurl', auth.checkMobile);
	app.get('/:noteurl', function(req, res){
		var noteurl = req.params.noteurl;
		tools.getNoteByUrl(noteurl, function(note){
			var noteInfo;

			if(note === null){
				noteInfo = {
					url: settings.sitedomain +'/'+noteurl,
					time: moment().format('YYYY-MM-DD HH:mm'),
					title: '',
					content: ''
				};
			}else{
				if(note.key){  //有密码
					res.redirect('/noteauth/'+noteurl);
				}
				else{
					noteInfo = {
						url: settings.sitedomain +'/'+noteurl,
						time: '上次更新：'+moment(note.update_at).format('YYYY-MM-DD HH:mm'),
						title: note.title,
						content: note.content
					};
				}
			}

			res.render('index', {
				siteInfo: siteInfo,
				noteInfo: noteInfo
			});
		});
		
	});




	app.get('/noteauth/:noteurl', auth.checkMobile);
	app.get('/noteauth/:noteurl', function(req, res){
		var noteurl = req.params.noteurl;
		tools.getNoteByUrl(noteurl, function(note){
			if(note === null){
				res.redirect('/'+noteurl);
			}
			else{
				if(!note.key){
					res.redirect('/'+noteurl);
				}
				else{
					res.render('noteauth', {siteInfo: siteInfo});
				}
			}
		});
	});
};
var settings = require('../settings');
var auth = require('../middlewares/auth');
var tools = require('../common/tools.js');
var Note = require('../controllers').Note;
var moment = require('moment');
var crypto = require('crypto');

var log4js    = require('log4js');
var logConfig = require('../common/logConfig.js');
log4js.configure(logConfig(__dirname));
var logInfo   = log4js.getLogger('onehour');

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

	app.post('/:noteurl', function(req, res){
		var noteurl = req.params.noteurl;
		var md5 = crypto.createHash('md5');

		var title = req.body.title,
		    psw = md5.update(req.body.psw).digest('hex'),
		    content = req.body.cont;
		var ip = tools.getClientIP(req);
		logInfo.info('收到post请求来自:'+ip);
		var result = {};


		if(psw === ""){
			result.error = '1';
			result.message = 'not get password';

			//返回客户端
			if(!res.headersSent){
				res.statusCode=200;
		        res.sendDate=false;
		        res.setHeader("Content-Type","text/plain;charset=utf-8");
		        res.setHeader("Access-Control-Allow-Origin","http://localhost:3000");
			}
			res.end(result.toString());
		}
		tools.getNoteByUrl(noteurl, function(note){
			if(note === null){ //新建一条
				return Note.newAndSaveNote(noteurl, title, content, '', ip, ip, '', 0, null, null, false, false, function(err, note){
					if(err){
						result.error = '2';
						result.message = err;
						result.time = moment().format('YYYY-MM-DD HH:mm:ss');

						//返回客户端
						if(!res.headersSent){
							res.statusCode=200;
					        res.sendDate=false;
					        res.setHeader("Content-Type","text/plain;charset=utf-8");
					        res.setHeader("Access-Control-Allow-Origin","http://localhost:3000");
						}
						res.end(JSON.stringify(result));
					}

					result.error = '0';
					result.message = note;
					result.time = moment().format('YYYY-MM-DD HH:mm:ss');

					//返回客户端
					if(!res.headersSent){
						res.statusCode=200;
				        res.sendDate=false;
				        res.setHeader("Content-Type","text/plain;charset=utf-8");
				        res.setHeader("Access-Control-Allow-Origin","http://localhost:3000");
					}
					res.end(JSON.stringify(result));
				});
			}else{
				if(note.key){  //有密码
					if(note.key === psw){
						return Note.updateNote(noteurl, title, content, ip, function(note){
							result.error = '0';
							result.message = note;
							result.time = moment().format('YYYY-MM-DD HH:mm:ss');

							//返回客户端
							if(!res.headersSent){
								res.statusCode=200;
						        res.sendDate=false;
						        res.setHeader("Content-Type","text/plain;charset=utf-8");
						        res.setHeader("Access-Control-Allow-Origin","http://localhost:3000");
							}
							res.end(JSON.stringify(result));
						});
					}
					else{  //密码错误
						result.error = '3';
						result.message = 'Auth error 非法操作';
						result.time = moment().format('YYYY-MM-DD HH:mm:ss');

						//返回客户端
						if(!res.headersSent){
							res.statusCode=200;
					        res.sendDate=false;
					        res.setHeader("Content-Type","text/plain;charset=utf-8");
					        res.setHeader("Access-Control-Allow-Origin","http://localhost:3000");
						}
						res.end(JSON.stringify(result));
					}
				}
				else{  //无密码
					return Note.updateNote(noteurl, title, content, ip, function(note){
						result.error = '0';
						result.message = note;
						result.time = moment().format('YYYY-MM-DD HH:mm:ss');

						//返回客户端
						if(!res.headersSent){
							res.statusCode=200;
					        res.sendDate=false;
					        res.setHeader("Content-Type","text/plain;charset=utf-8");
					        res.setHeader("Access-Control-Allow-Origin","http://localhost:3000");
						}
						res.end(JSON.stringify(result));
					});
				}
			}
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
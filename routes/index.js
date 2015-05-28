var settings = require('../settings');
var auth = require('../middlewares/auth');
var tools = require('../common/tools.js');
var Note = require('../controllers').Note;
var moment = require('moment');
var crypto = require('crypto');

var log4js    = require('log4js');
var logConfig = require('../common/logConfig.js');
log4js.configure(logConfig(__dirname));
var logInfo   = log4js.getLogger('normal');


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
		//PS:这里是读取,必须用tools
		tools.getNoteByUrl(noteurl, function(note){
			var noteInfo;
			if(note === null){
				noteInfo = {
					url: settings.sitedomain +'/'+noteurl,
					time: moment().format('YYYY-MM-DD HH:mm'),
					title: '',
					content: '',
					hasKey: 'nokey'
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
						content: note.content,
						hasKey: 'nokey'
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
		    //psw = req.body.psw,
		    psw = md5.update(req.body.psw).digest('hex'),
		    content = req.body.cont;
		var ip = tools.getClientIP(req);
		//logInfo.info('收到post请求来自:'+ip);
		var result = {};

		//Todo:这里密码验证有问题
		//空密码经md5加密后一样是一串md5码！

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
				return Note.newAndSaveNote(noteurl, title, content, '', ip, ip, '', '', '', 0, null, null, false, false, function(note){
					//newAndSaveNote没有返回err参数
					if(note){
							result.error = '0';
							result.message = '创建笔记成功:' + note;
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
					else{
						console.log('保存失败:'+note);
					}
					
				});
			}else{
				if(note.key){  //有密码
					//TODO：这里逻辑有问题
					if(note.key === psw){
						return Note.updateNote(noteurl, title, content, ip, function(note){
							result.error = '0';
							result.message = '验证通过,欢迎查看';
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
						result.message = '更新笔记成功';
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



	//==========================
	//           API
	//==========================



	/**
	 * 笔记加密接口
	 * 
	 */
	app.post('/api/setpsw', function(req, res){
		var noteurl = req.body.noteurl;
		var md5 = crypto.createHash('md5');
		var notepsw = req.body.notepsw;
		var oldnotepsw = req.body.oldnotepsw;
		var ip = tools.getClientIP(req);
		var result = {};
		if(noteurl&&notepsw){
			notepsw = md5.update(notepsw).digest('hex');
			tools.getNoteByUrl(noteurl, function(note){
				if(note === null){ //新建一条
					return Note.newAndSaveNote(noteurl, '', '', '', ip, ip, notepsw, '', '', 0, null, null, false, false, function(note){
						//newAndSaveNote方法没有返回err参数
						if(note){
								console.log('创建笔记及密码成功:'+note);
								result.error = '0';
								result.message = '创建笔记及密码成功';
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
						else{
							console.log('保存失败:'+note);
						}
					});
				}
				else{
					//原笔记无密码
					if(!note.key){
						return Note.updateNoteKey(noteurl, notepsw, ip, function(err,note){
							
								if(note){
									console.log('创建密码成功:'+note);
									result.error = '0';
									result.message = {info:'创建密码成功',remember_key: note.remember_key};
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
								else{
									console.log('err:'+err+',note:'+note);
								}
								
						});
					}
					else{  //原笔记已加密
						if(oldnotepsw){  //从客户端获取密码
							oldnotepsw = md5.update(oldnotepsw).digest('hex');
							if(oldnotepsw === note.key){  //密码验证通过
								return Note.updateNoteKey(noteurl, notepsw, ip, function(err,note){
									console.log('err:'+err+',note:'+note);
										result.error = '0';
										result.message = {info:'更改密码成功',remember_key: note.remember_key};
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
							else{ //密码验证错误
								//TODO:  ip改密次数限制
								logInfo.info('设置密码出错:旧密码验证不匹配!');
								result.error = '5';
								result.message = '旧密码验证不匹配';
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
						else{
							logInfo.info('设置密码出错:未提供旧密码:'+note);
							result.error = '4';
							result.message = '未提供旧密码';
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
				}
			});
		}
		else{
			logInfo.info('设置密码出错:未接收到密码或密码为空!');
			result.error = '3';
			result.message = '未接收到密码';
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


		
	});
};
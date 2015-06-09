var settings = require('../settings');
var auth = require('../middlewares/auth');
var tools = require('../common/tools.js');
var Note = require('../controllers').Note;
var moment = require('moment');
var crypto = require('crypto');
markdown = require('markdown').markdown;
var mobiRouter = require('./mobi');

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
		sitedomain : settings.sitedomain,
		mobilesite : settings.mobilesite,
		checkMobi: settings.checkMobile
	};
	var result = {};


	app.get('/', function(req, res){
		tools.getFreshNoteUrl(function(err, noteUrl){
			if(err)
				return res.render('error', {message: err, error: {status: 503, stack: null}});

			return res.redirect('/'+noteUrl);
		});
	});



	//==========================
	//           移动端
	//==========================
	app.get('/m/', function(req, res){
		tools.getFreshNoteUrl(function(err, noteUrl){
			if(err)
				return res.render('error', {message: err, error: {status: 503, stack: null}});

			return res.redirect('/m/'+noteUrl);
		});
	});

	app.get('/m/:noteurl([A-Za-z0-9]+)', auth.checkIsRightUrl);
	app.get('/m/:noteurl([A-Za-z0-9]+)', mobiRouter.index);

	app.get('/m/noteauth/:noteurl', mobiRouter.noteauth);


	//==========================
	//           PC端
	//==========================


	app.get('/:noteurl([A-Za-z0-9]+)', auth.checkIsRightUrl);
	app.get('/:noteurl([A-Za-z0-9]+)', function(req, res){
		var noteurl = req.params.noteurl;
		var Cookies = {};
	    req.headers.cookie && req.headers.cookie.split(';').forEach(function( Cookie ) {
	        var parts = Cookie.split('=');
	        Cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
	    });
	    var cookie_token_name = 'TOKEN_'+noteurl.toUpperCase(),
	    	cookie_token_val  = Cookies[cookie_token_name];  //undefined or token

		tools.getNoteByUrl(noteurl, function(note){
			var noteInfo;
			if(note === null){
				noteInfo = {
					url: settings.sitedomain +'/'+noteurl,
					noteid: noteurl,
					time: moment().format('YYYY-MM-DD HH:mm'),
					title: '',
					content: '',
					hasKey: 'nokey',
					isShared: 'noshare'
				};
			}else{
				noteInfo = {
					url: settings.sitedomain +'/'+noteurl,
					noteid: noteurl,
					time: moment().format('YYYY-MM-DD HH:mm'),
					title: decodeURI(note.title),
					content: decodeURI(note.content),
					hasKey: 'nokey',
					isShared: 'noshare'
				};
				if(note.key){  //有密码
					//有密码,检查token
					noteInfo.hasKey = 'haskey';
					if(cookie_token_val === undefined || moment(moment().format('YYYY-MM-DD HH:mm:ss')).isAfter(note.remember_keydate) || cookie_token_val !== note.remember_key){
						//remember验证不通过
						return res.redirect('/noteauth/'+noteurl);
					}
				}
				else{
					noteInfo.haskey = 'nokey';
				}

				if(note.is_shared){
					noteInfo.isShared = 'hasShared';
				}
			}

			return res.render('index', {
				siteInfo: siteInfo,
				noteInfo: noteInfo
			});
		});

	});

	app.post('/:noteurl', function(req, res){
		var noteurl = req.params.noteurl;
		var md5 = crypto.createHash('md5');

		var title = encodeURI(req.body.title),
		    content = encodeURI(req.body.cont);

		var Cookies = {};
	    req.headers.cookie && req.headers.cookie.split(';').forEach(function( Cookie ) {
	        var parts = Cookie.split('=');
	        Cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
	    });
	    var cookie_token_name = 'TOKEN_'+noteurl.toUpperCase(),
	    	cookie_token_val  = Cookies[cookie_token_name];  //undefined or token

		var ip = tools.getClientIP(req);
		//logInfo.info('收到post请求来自:'+ip);

		tools.getNoteByUrl(noteurl, function(note){
			if(note === null){ //新建一条
				return Note.newAndSaveNote(noteurl, title, content, false, '', ip, ip, '', '', '', 0, null, null, false, false, function(note){
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
						console.error('保存失败:'+note);
					}
					
				});
			}else{
				if(note.key){  //有密码
					if(cookie_token_val === undefined || moment(moment().format('YYYY-MM-DD HH:mm:ss')).isAfter(note.remember_keydate) || cookie_token_val !== note.remember_key){
						//remember验证不通过
						result.error = '1';
						result.message = '身份验证失败';
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


	app.get('/noteauth/:noteurl', function(req, res){
		var noteurl = req.params.noteurl;
		var Cookies = {};
	    req.headers.cookie && req.headers.cookie.split(';').forEach(function( Cookie ) {
	        var parts = Cookie.split('=');
	        Cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
	    });
	    var cookie_token_name = 'TOKEN_'+noteurl.toUpperCase(),
	    	cookie_token_val  = Cookies[cookie_token_name];  //undefined or token

		tools.getNoteByUrl(noteurl, function(note){
			if(note === null){
				return res.redirect('/'+noteurl);
			}
			else{
				if(!note.key){
					return res.redirect('/'+noteurl);
				}
				else{
					//有密码,检查token
					if(cookie_token_val === undefined || moment(moment().format('YYYY-MM-DD HH:mm:ss')).isAfter(note.remember_keydate) || cookie_token_val !== note.remember_key){
						//remember验证不通过
						siteInfo.noteurl = noteurl;
						return res.render('noteauth', {siteInfo: siteInfo});
					}
					else{
						return res.redirect('/'+noteurl);
					}
				}
			}
		});
	});


	app.post('/noteauth/:noteurl', function(req, res){
		var noteurl = req.params.noteurl,
			notepwd = req.body.note_pwd,
			isMobile = req.body.isMobi;
		console.log(isMobile);
		if(notepwd !== ""){
			var md5 = crypto.createHash('md5');
			notepwd = md5.update(notepwd).digest('hex');

			Note.checkNotePwd(noteurl, notepwd, function(errcode, note){
				if(errcode === 1){ //没有获取到笔记
					return isMobile? res.redirect('/m/'+noteurl) : res.redirect('/'+noteurl);
				}
				else if(errcode === 2){ //没有笔记密码
					return isMobile? res.redirect('/m/'+noteurl) : res.redirect('/'+noteurl);
				}
				else if(errcode === 3){ //密码不对
					console.error('密码验证失败:'+notepwd);
					return isMobile? res.redirect('/m/noteauth/'+noteurl) : res.redirect('/noteauth/'+noteurl);
				}
				else if(errcode === 0){
			         var cookieOpinoin = {
			         	path: '/',
			         	expires: new Date(note.remember_keydate),
			         	httpOnly: false
			         };
			         res.cookie('TOKEN_'+noteurl.toUpperCase(), note.remember_key, cookieOpinoin);
			         return isMobile? res.redirect('/m/'+noteurl) : res.redirect('/'+noteurl);

				}
				else{
					logInfo.error('未知错误@route:checkNotePwd');
					return isMobile? res.redirect('/m/noteauth'+noteurl) : res.redirect('/noteauth/'+noteurl);
				}
			});

			
		}
		else{
			//出错
			logInfo.info('出错:密码为空!');
			result.error = '1';
			result.message = '密码为空!';
			result.time = moment().format('YYYY-MM-DD HH:mm:ss');
			//返回客户端
			if(!res.headersSent){
				res.statusCode=200;
		        res.sendDate=false;
		        res.setHeader("Content-Type","text/plain;charset=utf-8");
		        res.setHeader("Access-Control-Allow-Origin","http://localhost:3000");
			}
			res.end(JSON.stringify(result));
			return res.redirect('/noteauth/'+noteurl);
		}
	});


	app.get('/share/:noteurl',function(req, res){
		var noteurl = req.params.noteurl;
		var noteInfo = {
			url: settings.sitedomain +'/'+noteurl,
			noteid: noteurl,
			time: moment().format('YYYY-MM-DD HH:mm'),
			title: '',
			content: '',
			hasKey: 'nokey',
			isShared: 'noshare'
		};
		tools.getNoteByUrl(noteurl, function(note){
			if(note){
				if(note.is_shared){
					noteInfo.title = decodeURI(note.title);
					noteInfo.content = markdown.toHTML(decodeURI(note.content));
					noteInfo.isShared = 'hasShared';
				}
			}

			res.render('share', {siteInfo: siteInfo, noteInfo: noteInfo});
		});
	});

	app.get('/404.html', function(req, res){
		return res.render('404', {siteInfo: siteInfo});
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

		//新建密码:需要提供新密码
		if(noteurl&&notepsw){
			notepsw = md5.update(notepsw).digest('hex');
			tools.getNoteByUrl(noteurl, function(note){
				if(note === null){ //新建一条
					return Note.newAndSaveNote(noteurl, '', '', false, '', ip, ip, notepsw, '', '', 0, null, null, false, false, function(note){
						//newAndSaveNote方法没有返回err参数
						if(note){
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
								return res.end(JSON.stringify(result));
						}
						else{
							console.error('保存失败:'+note);
						}
					});
				}
				else{
					//原笔记无密码
					if(!note.key){
						return Note.updateNoteKey(noteurl, notepsw, ip, function(err,note){
							
								if(note){
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
									console.error('err:'+err+',note:'+note);
								}
								
						});
					}
					else{  //原笔记已加密
						console.error('笔记已被加密,新建密码失败：'+note);
						result.error = '3';
						result.message = '笔记已被加密,新建密码失败';
						result.time = moment().format('YYYY-MM-DD HH:mm:ss');

						//返回客户端
						if(!res.headersSent){
							res.statusCode=200;
					        res.sendDate=false;
					        res.setHeader("Content-Type","text/plain;charset=utf-8");
					        res.setHeader("Access-Control-Allow-Origin","http://localhost:3000");
						}
						return res.end(JSON.stringify(result));
					}
				}
			});
		}
		//移除密码: 需要提供旧密码
		else if(noteurl && oldnotepsw){
			oldnotepsw_md5 = md5.update(oldnotepsw).digest('hex');
			tools.getNoteByUrl(noteurl, function(note){
				if(note === null){
						console.error('移除密码失败：没有找到noteurl');
						result.error = '1';
						result.message = '移除密码失败';
						result.time = moment().format('YYYY-MM-DD HH:mm:ss');

						//返回客户端
						if(!res.headersSent){
							res.statusCode=200;
					        res.sendDate=false;
					        res.setHeader("Content-Type","text/plain;charset=utf-8");
					        res.setHeader("Access-Control-Allow-Origin","http://localhost:3000");
						}
						return res.end(JSON.stringify(result));
				}
				else{
					if(oldnotepsw_md5 !== note.key){
						console.error('原密码验证失败,用户输入：'+oldnotepsw);
						result.error = '2';
						result.message = '原密码验证失败,移除密码失败';
						result.time = moment().format('YYYY-MM-DD HH:mm:ss');

						//返回客户端
						if(!res.headersSent){
							res.statusCode=200;
					        res.sendDate=false;
					        res.setHeader("Content-Type","text/plain;charset=utf-8");
					        res.setHeader("Access-Control-Allow-Origin","http://localhost:3000");
						}
						return res.end(JSON.stringify(result));
					}
					else{
						return Note.updateNoteKey(noteurl, '', ip, function(err,note){
							
								if(note){
									result.error = '999';
									result.message = {info:'移除密码成功',remember_key: note.remember_key};
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
									console.error('err:'+err+',note:'+note);
								}
								
						});
					}
				}
			});
		}
		else{
			logInfo.info('设置密码出错:未接收到密码或密码为空!');
			result.error = '4';
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



	/**
	 * 笔记分享状态
	 * 
	 */
	app.post('/api/sharestatus', function(req, res){
		var noteurl = req.body.noteurl;
		var isShare = req.body.isShare;
		var Cookies = {};
	    req.headers.cookie && req.headers.cookie.split(';').forEach(function( Cookie ) {
	        var parts = Cookie.split('=');
	        Cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
	    });
	    var cookie_token_name = 'TOKEN_'+noteurl.toUpperCase(),
	    	cookie_token_val  = Cookies[cookie_token_name];  //undefined or token

		if(noteurl){

			Note.isRightRemember(noteurl, cookie_token_val, function(err, note){
				if(err){
					//验证错误
					result.error = '2';
					return res.end(JSON.stringify(result));
				}
				else{
					Note.changeShare(noteurl,isShare,'',function(err, note){
						if(err){
							result.error = '3';
							return res.end(JSON.stringify(result));
						}
						else{
							result.error = '0';
							result.message = '更改分享状态成功:'+isShare;
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
				}
			});

		}
		else{
				console.error('更改分享失败：缺少noteurl');
				result.error = '1';
				result.message = '缺少noteurl';
				result.time = moment().format('YYYY-MM-DD HH:mm:ss');

				//返回客户端
				if(!res.headersSent){
					res.statusCode=200;
			        res.sendDate=false;
			        res.setHeader("Content-Type","text/plain;charset=utf-8");
			        res.setHeader("Access-Control-Allow-Origin","http://localhost:3000");
				}
				return res.end(JSON.stringify(result));
		}
	
	});

};
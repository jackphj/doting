var models = require('../models');
var Note = models.Note;
var moment = require('moment');
var crypto = require('crypto');

var log4js    = require('log4js');
var logConfig = require('../common/logConfig.js');
log4js.configure(logConfig(__dirname));
var logInfo   = log4js.getLogger('normal');


/**
 * 根据笔记url，查找一条笔记
 * @param {String} url 笔记URL
 * @param {Function} callback 回调函数
 */
exports.getNoteByUrl = function (url, callback) {
  Note.findOne({note_url: url}, function(err, note){
    if(err){
      callback(err);
    }
    else if(!note){
      callback(null, null);
    }
    else{
      callback(null, note);
    }
  });
};



/**
 * 更新笔记的标题、内容
 * @param {String} url 笔记的url
 * @param {String} title 笔记的标题
 * @param {String} content 笔记的内容
 * @param {Function} callback 回调函数
 */
exports.updateNote = function(url, title, content, ip, callback){
    Note.findOne({note_url: url}, function (err, note) {
        if (err || !note) {
        	logInfo('更新笔记出错：'+ err + '笔记url:'+note_url);
        	return callback(err);
        }

        note.title     = title;
        note.content   = content;
        note.updater_ip = ip;
        note.update_at = moment().format('YYYY-MM-DD HH:mm:ss');
        note.save(callback);
      });
};



/**
 * 更新/删除笔记的密码
 * @param {String} url 笔记的url
 * @param {String} key 笔记的密码(key为''时即删除)
 * @param {Function} callback 回调函数
 */
exports.updateNoteKey = function(url, key, ip, callback){
    Note.findOne({note_url: url}, function (err, note) {
        if (err || !note) {
          logInfo('更新笔记出错：'+ err + '笔记url:'+note_url);
          return callback(err);
        }

        //生成remember_key
        var remember_key = url + Date.parse(new Date()) + 'doting';
        var md5 = crypto.createHash('md5');
        remember_key = md5.update(remember_key).digest('hex');

        note.key        = key;
        note.updater_ip = ip;
        note.remember_key = remember_key;
        //30天
        note.remember_keydate  = moment().add('days', 30).format('YYYY-MM-DD HH:mm:ss');
        note.update_at  = moment().format('YYYY-MM-DD HH:mm:ss');
        note.save(callback(null, note));
      });
};




exports.newAndSaveNote = function(note_url, title, content, author_id, creator_ip, updater_ip, key, remember_key, remember_keydate, visit_count, create_at, update_at, content_is_html, deleted, callback) {
  var note = new Note();

  note.note_url         = note_url;
  note.title            = title || '';
  note.content          = content || '';
  note.author_id        = author_id || null;
  note.creator_ip       = creator_ip || '';
  note.updater_ip       = updater_ip || '';
  note.key              = key;
  note.remember_key     = remember_key;
  note.remember_keydate = remember_keydate;
  note.visit_count      = visit_count || 0;
  note.create_at        = create_at || moment().format('YYYY-MM-DD HH:mm:ss');
  note.update_at        = update_at || moment().format('YYYY-MM-DD HH:mm:ss');
  note.content_is_html  = content_is_html || false;
  note.deleted          = deleted || false;
  note.save(callback(note));
};

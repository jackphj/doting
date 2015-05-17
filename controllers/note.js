var models = require('../models');
var Note = models.Note;
var moment = require('moment');


/**
 * 根据笔记url，查找一条笔记
 * @param {String} url 笔记URL
 * @param {Function} callback 回调函数
 */
exports.getNoteByUrl = function (url, callback) {
  Note.findOne({note_url: url}, callback);
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
          return callback(err);
        }

        note.title     = title;
        note.content   = content;
        note.updater_ip = ip;
        note.update_at = moment().format('YYYY-MM-DD HH:mm:ss');
        note.save(callback);
      });
};




exports.newAndSaveNote = function(note_url, title, content, author_id, creator_ip, updater_ip, key, visit_count, create_at, update_at, content_is_html, deleted, callback) {
  var note = new Note();

  note.note_url        = note_url;
  note.title           = title || '';
  note.content         = content || '';
  note.author_id       = author_id || null;
  note.creator_ip      = creator_ip || '';
  note.updater_ip      = updater_ip || '';
  note.key             = key || '';
  note.visit_count     = visit_count || 0;
  note.create_at       = create_at || moment().format('YYYY-MM-DD HH:mm:ss');
  note.update_at       = update_at || moment().format('YYYY-MM-DD HH:mm:ss');
  note.content_is_html = content_is_html || false;
  note.deleted         = deleted || false;
  note.save(callback);
};

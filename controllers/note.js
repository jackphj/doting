var models = require('../models');
var Note = models.Note;

/**
 * 根据笔记url，查找一条笔记
 * @param {String} url 笔记URL
 * @param {Function} callback 回调函数
 */
exports.getNoteByUrl = function (url, callback) {
  Note.findOne({note_url: url}, callback);
};
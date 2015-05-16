var mongoose = require('mongoose');
var settings = require('../settings');

mongoose.connect(settings.db, function (err) {
  if (err) {
    console.error('connect to %s error: ', settings.db, err.message);
    process.exit(1);
  }
});

// models
require('./note');
// require('./topic');
// require('./reply');
// require('./topic_collect');
// require('./message');

exports.Note = mongoose.model('Note');
// exports.Topic = mongoose.model('Topic');
// exports.Reply = mongoose.model('Reply');
// exports.TopicCollect = mongoose.model('TopicCollect');
// exports.Message = mongoose.model('Message');
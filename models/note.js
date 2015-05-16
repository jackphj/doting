var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var NoteSchema = new Schema({
  note_url: { type: String },
  title: { type: String },
  content: { type: String },
  author_id: { type: ObjectId },
  key: { type: String }, // 密码
  visit_count: { type: Number, default: 0 },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
  content_is_html: { type: Boolean },
  deleted: {type: Boolean, default: false},
});

NoteSchema.index({note_url: -1});
NoteSchema.index({create_at: -1});
NoteSchema.index({visit_count: 1, create_at: -1});

mongoose.model('Note', NoteSchema);
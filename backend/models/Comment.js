const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  Comment: { type: String, required: true },
  Geta3: { type: Schema.Types.ObjectId, ref: 'Geta3', required: true },
  User: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  edited: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', CommentSchema);

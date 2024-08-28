const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userFavGeta3Schema = new Schema({
  User: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  Geta3: { type: Schema.Types.ObjectId, ref: 'Geta3', required: true },
});

module.exports = mongoose.model('UserFavGeta3', userFavGeta3Schema);

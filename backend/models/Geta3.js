const mongoose = require('mongoose');
const { DateTime } = require('luxon');
const Schema = mongoose.Schema;

const Geta3Schema = new Schema({
  User: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  Title: { type: String, required: true },
  isAuthorized: { type: Boolean, default: false },
  Description: { type: String, required: true, minLength: 1, maxLength: 500 },
  Related_link: { type: String },
  created_at: { type: Date, default: Date.now },
  condition: {
    type: String,
    enum: ['new', 'used', 'like new'],
    required: true,
  },
  carManufacturingYear: { type: String, required: true }, // New field
  brand: { type: String, required: true },
  carModel: { type: String, required: true },
  price: { type: Number, required: true }, // New field for price
  favorites: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  favoritesCount: { type: Number, default: 0 },
  imgs: { type: [String], required: true }, // Store all images in an array
});

// Add a text index to the schema
Geta3Schema.index({ Title: 'text', Description: 'text' });
Geta3Schema.index({ price: 1 });

// Virtual property to format the date
Geta3Schema.virtual('Date_formatted').get(function () {
  const date = DateTime.fromJSDate(this.created_at);
  const day = date.day;
  const month = date.toFormat('LLL');
  const year = date.year;

  let daySuffix = '';
  if (day === 1 || day === 21 || day === 31) {
    daySuffix = 'st';
  } else if (day === 2 || day === 22) {
    daySuffix = 'nd';
  } else if (day === 3 || day === 23) {
    daySuffix = 'rd';
  } else {
    daySuffix = 'th';
  }

  return `${month} ${day}${daySuffix}, ${year}`;
});

module.exports = mongoose.model('Geta3', Geta3Schema);

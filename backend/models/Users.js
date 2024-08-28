const mongoose = require('mongoose');
const { DateTime } = require("luxon");

const userSchema = new mongoose.Schema({
  FirstName: { type: String, required: true, maxLength: 50 },
  LastName: { type: String, required: true, maxLength: 50 },
  Email: { type: String, required: true, maxLength: 256, unique: true },
  PhoneNumber: { type: String, required: true, unique: true },
  Username: { type: String, required: true, unique: true },
  Password: { type: String, required: true, maxLength: 256, minLength: 8 },
  isAdmin: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  refreshToken: String,
  IsPhoneVerified: { type: Boolean, default: false },
  IsEmailVerified: { type: Boolean, default: false },
  Location: { type: String, default: '' },
  otp: {
    code: String,
    expiresAt: Date
  },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Geta3' }],
  postCount: { type: Number, default: 0 }  // Store postCount in the database
});

userSchema.virtual("Date_formatted").get(function () {
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

const User = mongoose.model('User', userSchema);
module.exports = User;

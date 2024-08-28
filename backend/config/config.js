require('dotenv').config(); // Load environment variables from .env file

module.exports = {
  secretOrKey: process.env.JWT_SECRET,
  mongoURI: process.env.MONGO_URI,
  // Add other configuration values as needed
};

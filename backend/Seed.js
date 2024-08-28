const mongoose = require('mongoose');
const Geta3 = require('./models/Geta3'); // Update with the correct path to your Geta3 model

// MongoDB connection URI
const mongoURI = process.env.MONGO_URL || 'mongodb+srv://getacom092:Getacomem@cluster0.0v71lth.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');

    // Remove all posts from the Geta3 collection
    return Geta3.deleteMany({});
  })
  .then(() => {
    console.log('All posts deleted successfully.');
    mongoose.connection.close(); // Close the database connection
  })
  .catch(err => {
    console.error('Error deleting posts:', err);
    mongoose.connection.close(); // Ensure the connection is closed on error
  });

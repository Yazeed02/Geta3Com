//Libraries
const express = require('express'); //Inheretance 
const createError = require('http-errors'); //Server Errors (Exception Handeling)
const path = require('path'); //For Uploads Path
const cookieParser = require('cookie-parser'); //Authorize The Device to use this server (Always on in this project)
const logger = require('morgan'); //
const passport = require('passport'); //Passport (ID) for the user logged in (Used for functions need the user info(Encrypted))
const cors = require('cors'); //Url's that can use this server
const fs = require('fs'); //
const mongoose = require('mongoose'); //MongoDB
require('dotenv').config(); //to use the .env file

const Geta3Router = require('./routes/Geta3Router'); //Inhereted From Express, contain the API's that have the Controllers
const AuthRouter = require('./routes/AuthRouter'); //Inhereted From Express, contain the API's that have the Controllers

require('./passport-config')(passport); //Passport (ID)

mongoose.set('strictQuery', false);
const mongoDB = process.env.MONGO_URI; //Check MongoDB if the URL is real or not

async function main() { //Syncronize between the data in mongo and the terminal
  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }); //Wait until the MongoDB Connected and synced successfully
  console.log('Connected to MongoDB successfully.');
}
main().catch((err) => console.error(`MongoDB connection error: ${err.message}`));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}


const allowedOrigins = ['http://localhost:5001', 'http://127.0.0.1:5001'];
const corsOptions = { //if the URL is not available, show error
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};

const app = express(); //Define the App that will open everything

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors(corsOptions));
app.use(passport.initialize());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from 'uploads' directory
app.use('/uploads', (req, res, next) => {
  console.log('Request for file:', req.originalUrl);
  next();
}, express.static(path.join(__dirname, 'uploads')));

app.use('/api_Geta3', Geta3Router);
app.use('/api_auth', AuthRouter);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  console.error('Error handler:', err.stack);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (req.originalUrl.startsWith('/api_')) {
    return res.status(err.status || 500).json({ error: err.message });
  }

  res.status(err.status || 500);
  res.render('error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
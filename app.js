const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const routes = require('./routes/Routes');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// express app
const app = express();


// connect to MongoDB
const dbURI = process.env.MONGODB_URI_1;
const PORT = process.env.PORT || 8000;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true})
  .then(result => app.listen(PORT, () => {console.log(`Server running on port ${PORT}`)}))
  .catch(err => console.log(err));

// setting up view engine
app.set('view engine', 'ejs');

//middleware & static files
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true}));
app.use(morgan('dev'));
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
})

// routes
app.use(routes);

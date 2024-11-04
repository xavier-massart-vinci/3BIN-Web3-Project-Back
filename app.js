var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
require('dotenv').config();

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auths');
var usersRouter = require('./routes/users');
var friendsRouter = require('./routes/friends');

var app = express();


var corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
  ? process.env.PRODUCTION_ORIGIN : '*'
}

app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
    origin: 'http://localhost:5173'  // Replace with your front-end URL
}));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/friends', friendsRouter);

module.exports = app;

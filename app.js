var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var { Server } = require('socket.io');
require('dotenv').config();

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auths');
var usersRouter = require('./routes/users');

var app = express();
// const server = createServer(app);
const io = new Server({
  cors: {
    origin: "*"
  }
});

io.listen(4000);


io.on('connection', (socket) => { 
  console.log("A user is connected");

});

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

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);

module.exports = app;

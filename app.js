const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auths');
const usersRouter = require('./routes/users');
const socketAuthMiddleware = require('./middleware/socketAuthMiddleware');

var app = express();

const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
io.listen(4000); //socket.io server listens to port 4000 (TODO CLEANUP)

socketAuthMiddleware(io);



io.on('connection', (socket) => { 
  console.log(socket.user.username, " is connected");
  socket.on('disconnect', () => {
    console.log(socket.user.username, " is disconnected");
  });

  socket.on('globalChatMessage', (msg) => {
    io.emit('globalChatMessage', {msg, user: socket.user.username});
    console.log('message: ' + msg + ' from ' + socket.user.username);
  });
});


var corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.PRODUCTION_ORIGIN 
    : '*'
};

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
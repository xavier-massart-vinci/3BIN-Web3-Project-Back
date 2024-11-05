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

const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
io.listen(4000); //socket.io server listens to port 4000 (TODO CLEANUP)


io.use((socket, next) => { 
  const token = socket.handshake.auth.token;
   if (!token) { 
      return next(new Error('Authentication error')); 
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) { 
          return next(new Error('Authentication error')); 
      } 
      
    socket.user = {username: user.username}; 
    next(); 
  }); 
});

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

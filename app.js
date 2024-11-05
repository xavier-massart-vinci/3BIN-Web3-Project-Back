var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var { Server } = require('socket.io');
var http = require('http');
require('dotenv').config();

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auths');
var usersRouter = require('./routes/users');
const verifyAuth = require('./middleware/authMiddleware');
const socketAuthMiddleware = require('./middleware/socketAuthMiddleware');

var app = express();
const server = http.createServer(app);

var corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
  ? process.env.PRODUCTION_ORIGIN : '*'
}

app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use(verifyAuth) 

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

socketAuthMiddleware(io)

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);

io.on('connection', (socket) => {
  console.log('A user connected');
  console.log(JSON.stringify(socket.user));
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});

module.exports = app;

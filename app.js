const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const authSocketMiddleware = require('./middleware/authSocketMiddleware');


const indexRouter = require('./routes/index');
const authRouter = require('./routes/auths');
const usersRouter = require('./routes/users');
const friendsRouter = require('./routes/friends');

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.PRODUCTION_ORIGIN 
    : '*'
};





// SOCKET.IO
const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
}).listen(4000); // TODO: Change port number

const globalChat = require('./socket/chatGlobalHandler')(io);

// Middleware (connection)
io.use(authSocketMiddleware);


// listen for incoming connections
io.on('connection', (socket) => { 
  console.log(socket.user.username, " is connected"); // DEBUG
  
  socket.on('disconnect', () => {
    console.log(socket.user.username, " is disconnected"); // DEBUG
  });

  // Attach event listeners
  socket.on('globalChatMessage', globalChat);
  // ADD YOUR EVENT LISTENERS HERE
});





// API
var app = express();

// Middleware
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
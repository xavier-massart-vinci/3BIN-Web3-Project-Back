const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const { Server } = require('socket.io');
const connect = require('./utils/mongo');
require('dotenv').config();

const authSocketMiddleware = require('./middleware/authSocketMiddleware');
const messageSocketMiddleware = require('./middleware/messageSocketMiddleware');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auths');
const usersRouter = require('./routes/users');
const addMessageInDB = require('./utils/message');

const app = express();
const httpServer = require('http').Server(app);
// connect To MongoDB
connect();

const corsOptions = {
  origin:  process.env.NODE_ENV == "production" ? process.env.PRODUCTION_ORIGIN :'*', 
  methods: ['GET', 'POST'],
};


const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ["websocket", "polling"]
});


const globalChat = require('./socket/globalChatHandler')(io);
const privateChat = require('./socket/privateChatHandler')(io);
const chatHistoryHandler = require('./socket/chatHistoryHandler')(io);

// Middleware (connection)
io.use(authSocketMiddleware);
io.use(messageSocketMiddleware);

// listen for incoming connections
io.on('connection', (socket) => { 
  console.log(socket.user.username, " is connected"); // DEBUG
  
  socket.on('disconnect', () => {
  console.log(socket.user.username, " is disconnected"); // DEBUG

    // Send to all users the disconnected user
    socket.broadcast.emit('userDisconnect', {user: socket.user, socketId: socket.id});
  });

  // Send to the newly connected user the list of users
  const users = Array.from(io.of("/").sockets).map(([id, soc]) => ({
    user: soc.user,
    socketId: id,
  }));
  socket.emit('userDiscoveryInit', users);

  socket.broadcast.emit('userDiscovery', {user: socket.user, socketId: socket.id});
  
  // Attach event listeners
  socket.on('chatHistory', chatHistoryHandler);
  socket.on('globalChatMessage', globalChat);
  socket.on('privateChatMessage', privateChat);
});





// API

// Middleware
app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);



module.exports = { app, httpServer, io };
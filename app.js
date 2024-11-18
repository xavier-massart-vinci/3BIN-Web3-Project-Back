const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const { Server } = require('socket.io');
const connect = require('./services/mongo');
const { users } = require("./services/usersSocket");

require('dotenv').config();

// Middleware
const authSocketMiddleware = require('./middleware/authSocketMiddleware');
const messageSocketMiddleware = require('./middleware/messageSocketMiddleware');

// Socket Handlers
const globalChat = require('./socket/globalChatHandler');
const privateChat = require('./socket/privateChatHandler');
const chatHistoryHandler = require('./socket/chatHistoryHandler');

// Road API
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auths');
const usersRouter = require('./routes/users');
const friendsRouter = require('./routes/friends');

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
app.set('socketio', io);




// Socket.io

// Middleware 
io.use(authSocketMiddleware);
io.use(messageSocketMiddleware);

io.on('connection', (socket) => { 
  const newUser = {username: socket.user.username, id: socket.user.id};

  socket.on('disconnect', () => {
    // Send to all users the disconnected user
    socket.broadcast.emit('userDisconnect', newUser);
    users.removeUser(socket.user.id);
  });

  // Send to the newly connected user the list of users (id, username)
  const usersList = Array.from(io.of("/").sockets).map(([id, socket]) => ({
    username: socket.user.username,
    id: socket.user.id
  }));
  socket.emit('userDiscoveryInit', usersList);


  // Send to all users the newly connected user
  socket.broadcast.emit('userDiscovery', newUser);
  users.addUser(socket.user.id, socket.id); 
  
  
  // Attach event listeners
  socket.on('chatHistory', chatHistoryHandler(socket, io));
  socket.on('globalChatMessage', globalChat(socket, io));
  socket.on('privateChatMessage', privateChat (socket, io));
});





// API

// Middleware
app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/friends', friendsRouter);



module.exports = { app, httpServer, io };
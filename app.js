const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
require('dotenv').config();

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auths');
const usersRouter = require('./routes/users');
const socketAuthMiddleware = require('./middleware/socketAuthMiddleware');

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.PRODUCTION_ORIGIN 
    : '*'
};

app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

socketAuthMiddleware(io);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);

io.on('connection', (socket) => {
  console.log(`${socket.user.username} is connected`);
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});

module.exports = app;
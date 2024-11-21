const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const { Server } = require("socket.io");
const connect = require("./services/mongo");
const { users } = require("./services/usersSocket");
const http = require("http");
const https = require("https");
const fs = require("fs");

require("dotenv").config();

// Middleware
const authSocketMiddleware = require("./middleware/authSocketMiddleware");
const messageSocketMiddleware = require("./middleware/messageSocketMiddleware");

// Socket Handlers
const globalChat = require("./socket/globalChatHandler");
const privateChat = require("./socket/privateChatHandler");
const chatHistoryHandler = require("./socket/chatHistoryHandler");
const isTypingHandler = require("./socket/isTypingHandler");

// Road API
const authRouter = require("./routes/auths");
const usersRouter = require("./routes/users");
const friendsRouter = require('./routes/friends');

const app = express();

// connect To MongoDB
connect();

let server;
if (process.env.NODE_ENV === "production") {
  // Load SSL/TLS certificate and private key
  const privateKey = fs.readFileSync("./cert/privkey.pem");
  const certificate = fs.readFileSync("./cert/cert.pem");
  const ca = fs.readFileSync("./cert/chain.pem");

  const credentials = { key: privateKey, cert: certificate, ca };

  // Create HTTPS server
  server = https.createServer(credentials, app);
  console.log("Running in production mode with HTTPS");
} else {
  // Create HTTP server for development
  server = http.createServer(app);
  console.log("Running in development mode with HTTP");
}

const corsOptions = {
  origin:   process.env.NODE_ENV === 'production' ? process.env.PRODUCTION_ORIGIN : '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

const io = new Server(server, {
  cors: corsOptions,
  transports: ["websocket", "polling"],
});
app.set('socketio', io);

// Socket.io

// Middleware
io.use(authSocketMiddleware);
io.use(messageSocketMiddleware);

io.on("connection", (socket) => {
  const newUser = { username: socket.user.username, id: socket.user.id };

  socket.on("disconnect", () => {
    // Send to all users the disconnected user
    socket.broadcast.emit("userDisconnect", newUser);
    users.removeUser(socket.user.id);
  });

  // Send to the newly connected user the list of users (id, username)
  const usersList = Array.from(io.of("/").sockets).map(([id, socket]) => ({
    username: socket.user.username,
    id: socket.user.id,
  }));
  socket.emit("userDiscoveryInit", usersList);

  // Send to all users the newly connected user
  socket.broadcast.emit("userDiscovery", newUser);
  users.addUser(socket.user.id, socket.id);

  // Attach event listeners
  socket.on("chatHistory", chatHistoryHandler());
  socket.on("globalChatMessage", globalChat(io));
  socket.on("privateChatMessage", privateChat(socket));
  socket.on("isTyping", isTypingHandler(io));
});

// API

// Middleware
app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use('/friends', friendsRouter);

module.exports = { app, server, io };

const jwt = require("jsonwebtoken");
const Users = require("../models/Users");

const authSocketMiddleware = (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usr) => {
    if (err) {
      return next(new Error("Authentication error"));
    }

    Users.findOne({ username: usr.username }).then((user) => {
      if (!user) {
        return next(new Error("Authentication error"));
      }
      socket.user = user;
      next();
    });
  });
};

module.exports = authSocketMiddleware;

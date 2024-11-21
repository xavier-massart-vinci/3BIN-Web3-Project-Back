const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

let usersTimeout = new Map();

const validMessage = (message) => {
  return (
    message &&
    typeof message === "object" &&
    typeof message.content === "string" &&
    typeof message.to === "string" &&
    typeof message.type === "string" &&
    message.content.length > 0 &&
    message.to.length > 0 &&
    message.type.length > 0
  );
};

const modifyMessageForSecurity = (message, socket) => {
  message.id = uuidv4();
  message.time = new Date().toISOString();
  message.from = socket.user.id;
  return message;
};

const sendErrorMessages = (socket, event, content) => {
  socket.emit(event, {
    type: "error",
    content,
    time: new Date().toISOString(),
    id: uuidv4(),
  });
};

const timeoutCheck = (socket) => {
  if (
    usersTimeout.has(socket.user.id) &&
    Date.now() <
      usersTimeout.get(socket.user.id) +
        parseInt(process.env.DELAY_BETWEEN_MESSAGES)
  ) {
    return true;
  }
  return false;
};

const messageSocketMiddleware = (socket, next) => {
  socket.use((packet, next) => {
    const [event, message] = packet;

    if (event === "chatHistory") {
      return next();
    }

    if (event === "isTyping") {
      return next();
    }

    if (!validMessage(message)) {
      return new Error("Invalid message format");
    }

    // Check if message is too long
    if (message.content.length > process.env.MAX_MESSAGE_LENGTH) {
      sendErrorMessages(socket, event, "Message trop long");
      return new Error("Message is too long");
    }

    // Check if user is sending messages too fast
    if (timeoutCheck(socket)) {
      sendErrorMessages(
        socket,
        event,
        "Vous envoyez des messages trop vite !!"
      );
      return new Error("You are sending messages too fast");
    } else {
      usersTimeout.set(socket.user.id, Date.now());
    }

    modifyMessageForSecurity(message, socket);

    return next();
  });

  return next();
};

module.exports = messageSocketMiddleware;

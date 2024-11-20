const addMessageInDB = require("../services/message");
const commandHandler = require("./commandHandler");

module.exports = (io) => {
  const globalChat = async function (msg) {
    const socket = this;

    if (msg.content.startsWith("/")) {
      await commandHandler(msg);
    }

    if (msg.type === "error") {
      socket.emit("globalChatMessage", msg);
      return;
    }

    io.emit("globalChatMessage", msg);
    const message = {
      sender: socket.user.id,
      receiver: "global",
      content: msg.content,
      type: msg.type,
      timestamp: msg.time,
      inGlobalChat: true,
    };

    await addMessageInDB(message);
  };
  return globalChat;
};

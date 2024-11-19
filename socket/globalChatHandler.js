const addMessageInDB = require("../services/message");

module.exports = (socket, io) => {
  const globalChat = async function (msg) {
    const socket = this;

    if (msg.content.startsWith("/")) {
      require("./commandHandler")(msg);
    }

    if(msg.type === "error") {
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

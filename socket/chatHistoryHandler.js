const Messages = require("../models/Messages");

module.exports = () => {
  const chatHistory = async function (msg) {
    const socket = this;
    const inGlobalChat = msg.inGlobalChat;
    let messages = [];

    if (inGlobalChat) {
      messages = await Messages.find({ inGlobalChat: true })
        .sort({ timestamp: -1 }) 
        .limit(20);
    } else {
      const user = socket.user.id;
      const contact = msg.contact;
      messages = await Messages.find({
        $and: [
          { inGlobalChat: false },
          {
            $or: [
              { sender: user, receiver: contact },
              { sender: contact, receiver: user },
            ],
          },
        ],
      })
      .sort({ timestamp: -1 }) 
      .limit(20);
    }
    messages = messages.map((message) => {
      return {
        id: message._id,
        content: message.content,
        from: message.sender,
        to: message.receiver,
        type: message.type,
        time: message.timestamp,
      };
    });
    socket.emit("chatHistory", messages);
  };

  return chatHistory;
};
const Messages = require("../models/Messages");

const addMessageInDB = async ({
  sender,
  receiver,
  type,
  content,
  timestamp,
  inGlobalChat,
}) => {
  try {
    const newMessage = new Messages({
      sender,
      receiver,
      type,
      content,
      timestamp,
      inGlobalChat,
    });
    await newMessage.save();
  } catch (error) {
    return new Error("Error adding message to DB");
  }
};

module.exports = addMessageInDB;

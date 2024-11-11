const Messages = require('../models/Messages');

const addMessageInDB = async ({ sender, receiver, type, content, time, inGlobalChat}) => {
    try {
        const newMessage = new Messages({
            sender,
            receiver,
            type,
            content,
            time,
            inGlobalChat
        });
        await newMessage.save();
    } catch (error) {
        return false;
    }
};

module.exports = addMessageInDB;
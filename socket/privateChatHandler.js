const addMessageInDB = require("../utils/message");

module.exports = (io) =>{
    const privateChat = function(msg) {
        const socket = this;
        socket.to(msg.for).emit("privateChatMessage", msg);
        const message = {
            sender: socket.user.username,
            receiver: msg.for,
            content: msg.content,
            type: msg.type,
            time: msg.time,
            inGlobalChat: false
        };
        addMessageInDB(message);
    };
    
    return privateChat;
};
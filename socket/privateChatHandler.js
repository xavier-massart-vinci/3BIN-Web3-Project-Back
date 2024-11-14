const addMessageInDB = require("../utils/message");

module.exports = (io) =>{
    const privateChat = async function(msg) {
        const socket = this;
        socket.to(msg.toSocket).emit("privateChatMessage", msg);
        const message = {
            sender: socket.user.id,
            receiver: msg.to,
            content: msg.content,
            type: msg.type,
            timestamp: msg.time,
            inGlobalChat: false
        };
        await addMessageInDB(message);
    };
    
    return privateChat;
};
const addMessageInDB = require("../utils/message");
const { users } = require("../utils/usersSocket");

module.exports = (io) =>{
    const privateChat = async function(msg) {
        const socket = this;
        let toSocket = users.getUser(msg.to);
        socket.to(toSocket).emit("privateChatMessage", msg); // Send the message to the receiver
        socket.emit("privateChatMessage", msg); // Send the message to the sender
    
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
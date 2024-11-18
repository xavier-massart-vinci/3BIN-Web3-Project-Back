const addMessageInDB = require("../services/message");
const { users } = require("../services/usersSocket");

module.exports = (io) =>{
    const privateChat = async function(msg) {
        const socket = this;

        if(msg.content.startsWith("/")){
            require("./commandHandler")(msg);
        }
        
        let toSocket = users.getUser(msg.to);
        // TODO check if receiver is a friend of the sender
        
        // socket send the message to the receiver
        socket.to(toSocket).emit("privateChatMessage", msg); // Send the message to the receiver
        socket.emit("privateChatMessage", msg); // Send the message to the sender
        
        // save message in the database
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
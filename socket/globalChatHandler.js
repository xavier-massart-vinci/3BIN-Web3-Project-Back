const addMessageInDB = require("../services/message");

module.exports = (io) =>{
    const globalChat = async function(msg) {

        console.log(msg)
        const socket = this;
        io.emit('globalChatMessage', msg);
        const message = {
            sender: socket.user.id,
            receiver: "global",
            content: msg.content,
            type: msg.type,
            timestamp: msg.time,
            inGlobalChat: true
        };
        
        await addMessageInDB(message);

    };

    return globalChat;
};
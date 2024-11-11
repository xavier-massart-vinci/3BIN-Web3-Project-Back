module.exports = (io) =>{
    const globalChat = function(msg) {
        const socket = this;
        io.emit('globalChatMessage', msg);
        const message = {
            sender: socket.user.username,
            receiver: msg.for,
            content: msg.content,
            type: msg.type,
            time: msg.time,
            inGlobalChat: true
        };
        addMessageInDB(message);
    };

    return globalChat;
};
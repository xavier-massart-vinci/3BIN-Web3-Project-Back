module.exports = (io) =>{
    const globalChat = function(msg) {
        const socket = this;
        io.emit('globalChatMessage', {content: msg.content, user: socket.user.__id, type: "text"});
    };

    return globalChat;
};
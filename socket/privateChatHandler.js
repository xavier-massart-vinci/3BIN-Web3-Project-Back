module.exports = (io) =>{

    const privateChat = function(msg) {
        const socket = this;
        socket.to(msg.for).emit("privateChatMessage", msg);
    };

    return privateChat;
};
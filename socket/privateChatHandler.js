module.exports = (io) =>{
    const privateChat = function(msg) {
        const socket = this;

        if(msg.content.startsWith("/")){
            require("./commandHandler")(msg);
        }
            //pq pas de io.emit mais socket.to ?
            socket.to(msg.for).emit("privateChatMessage", msg);
    };
    
    return privateChat;
};
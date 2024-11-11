module.exports = (io) =>{
    const globalChat = function(msg) {
        const socket = this;

        if(msg.content.startsWith("/")){
            require("./commandHandler")(msg);
            io.emit('globalChatMessage', {content: msg.content, user: socket.user.__id, type: msg.type});
        }else{
            io.emit('globalChatMessage', {content: msg.content, user: socket.user.__id, type: "text"});
        }
    };

    return globalChat;
};
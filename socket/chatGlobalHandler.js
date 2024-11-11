module.exports = (io) =>{

    const globalChat = function(msg) {
        const socket = this;

        io.emit('globalChatMessage', {msg, user: socket.user.username});
        console.log('message: ' + msg + ' from ' + socket.user.username);
    };

    return globalChat;
};
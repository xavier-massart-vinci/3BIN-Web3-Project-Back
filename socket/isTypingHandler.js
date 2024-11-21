const { users } = require("../services/usersSocket");

module.exports = (io) => {

    const isTypingHandler = async function (data) {
        const socket = this;
        
        if (data.to === "global") {
            socket.broadcast.emit("isTyping", {
                username: socket.user.username,
                chat: "global",
                status: data.status
            });
            return;
        }

        let toSocket = users.getUser(data.to);

        if (!toSocket) return;

        socket.to(toSocket).emit("isTyping", {
            username: socket.user.username, 
            chat: data.to,
            status: data.status
        });


    }
    return isTypingHandler;
};

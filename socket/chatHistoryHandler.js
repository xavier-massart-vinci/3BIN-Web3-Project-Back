const Messages = require("../models/Messages");

module.exports = (io) => {
    const chatHistory = async function(msg) {
        const socket = this;
        const inGlobalChat = msg.inGlobalChat;
        let messages = [];

        if(inGlobalChat) {
            messages = await Messages.find({ inGlobalChat: true }); 
        } else {
            const user = socket.user.id; 
            const contact = msg.contact;
            messages = await Messages.find({
                $and: [
                    { inGlobalChat: false },
                    {
                        $or: [
                            { sender: user, receiver: contact },
                            { sender: contact, receiver: user }
                        ]
                    }
                ],
                
            });
        }
       messages = messages.map(message => {
              return {
                content: message.content,
                from: message.sender,
                to: message.receiver,
                type: message.type,
                time: message.timestamp
              }});
        socket.emit('chatHistory', messages);
    };

    return chatHistory;
};
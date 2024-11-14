module.exports = (io) =>{
    const globalChat = async function(msg) {
        const socket = this;
        const contact = msg.to;
        let messages;

        if(contact == 'global') {
            messages = await Message.find({ inGlobalChat: true })
            .sort({ timestamp: 1 })
            .limit(20);

        } else {
            const user = socket.user.id;
            messages = await Message.find({
                $and: [
                    { isFlinGlobalChat: false}
                ],
                $or: [
                    { sender: user, receiver: contact },
                    { sender: contact, receiver: user }
                ]
            }).sort({ timestamp: 1 })
            .limit(20);
        }
        socket.emit('chatHistory', messages); 

    };

    return globalChat;
};
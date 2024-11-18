const addMessageInDB = require("../services/message");
const { users } = require("../services/usersSocket");

module.exports = (io) =>{
    const privateChat = async function(msg) {
        const socket = this;
        let toSocket = users.getUser(msg.to);
        console.log("toSocket", toSocket);

        // TODO check if receiver is a friend of the sender
        // Get the sender and receiver id
        const sender = socket.user;
        const receiverId = msg.to;
        console.log("sender", sender);
        console.log("receiverId", receiverId);

 
        // Check if the sender and receiver are friends
        const isFriend = sender.friends.includes(receiverId);
        console.log("isFriend", isFriend);
        if (!isFriend) {
            return; 
        } 

        // socket send the message to the receiver
        if(toSocket){
            socket.to(toSocket).emit("privateChatMessage", msg); // Send the message to the receiver
        }
        socket.emit("privateChatMessage", msg); // Send the message to the sender
        
        // save message in the database
        const message = {
            sender: socket.user.id,
            receiver: msg.to,
            content: msg.content,
            type: msg.type,
            timestamp: msg.time,
            inGlobalChat: false
        };
        await addMessageInDB(message);
    };
    
    return privateChat;
};
const addMessageInDB = require("../services/message");
const User = require("../models/Users");
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
 
 
        // Récupérer le destinataire depuis la base de données
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return console.log("Destinataire introuvable");
        }

        // Vérifier si le destinataire est dans la liste des amis de l'expéditeur
        const isFriendSender = sender.friends.includes(receiverId);
        const isFriendReceiver = receiver.friends.includes(sender._id);
        console.log("isFriendSender:", isFriendSender);
        console.log("isFriendReceiver:", isFriendReceiver);

        // Si l'un des deux n'est plus ami avec l'autre, ne pas envoyer le message
        if (!isFriendSender || !isFriendReceiver) {
            socket.emit('messageError', {
                error: "La personne a qui vous voulez envoyer un message n'est plus ami avec vous."
            });
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
const addMessageInDB = require("../services/message");
const User = require("../models/Users");
const { users } = require("../services/usersSocket");
const commandHandler = require("./commandHandler");

module.exports = () => {
  const privateChat = async function (msg) {
    const socket = this;

    if (msg.content.startsWith("/")) {
      await commandHandler(msg);
    }

    if (msg.type === "error") {
      socket.emit("privateChatMessage", msg);
      return;
    }

    let toSocket = users.getUser(msg.to);
    // Get the sender and receiver id
    const senderId = socket.user._id;
    const receiverId = msg.to;

    // Récupérer les deux user après ajout depuis la base de données
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    // Vérifier si le destinataire est dans la liste des amis de l'expéditeur
    const isFriendSender = sender.friends.includes(receiverId);
    const isFriendReceiver = receiver.friends.includes(sender._id);

    // Si l'un des deux n'est plus ami avec l'autre, ne pas envoyer le message
    if (!isFriendSender || !isFriendReceiver) {
      msg.content = "La personne a qui vous voulez envoyer un message n'est plus ami avec vous.";
      msg.type = "error";
      socket.emit("privateChatMessage", msg);
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
      inGlobalChat: false,
    };

    await addMessageInDB(message);
  };

  return privateChat;
};

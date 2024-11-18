const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const FriendRequest = require('../models/FriendsRequest');
const { users } = require("../services/usersSocket");
const verifyAuth = require('../middleware/authAPIMiddleware');
 

router.get('/getFriends', verifyAuth, async (req, res) => {
    const { username } = req.user;

    try {
        const currentUser = await User.findOne({ username });
        const friends = await User.find({ _id: { $in: currentUser.friends } });
        res.status(200).json(friends);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching friends list' });
    }
});

router.get('/search', verifyAuth, async (req, res) => {
    const {username} = req.query;
    if(!username){
        return res.sendStatus(400);
    }
    try{
        const users = await User.find({username: {$regex: username, $options: 'i'}});
        return res.status(200).json(users);
    } catch {
        return res.sendStatus(500).json({error: 'Error searching users'});
    }
});


router.post('/sendFriendRequest', verifyAuth, async (req, res) => {
    const currentUsername  = req.user.username;
    const friendUsername = req.body.username;

    try {
        const currentUser = await User.findOne({ username: currentUsername });
        const userToAdd = await User.findOne({ username: friendUsername });

        if (!userToAdd) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (currentUser.username === userToAdd.username) {
            return res.status(400).json({ error: 'You cannot send a friend request to yourself' });
        }

        // Check if request already exists
        const existingRequest = await FriendRequest.findOne({
            sender: currentUser._id,
            receiver: userToAdd._id,
        });

        if (existingRequest) {
            return res.status(400).json({ error: 'Friend request already sent' });
        }

        const newRequest = new FriendRequest({
            sender: currentUser._id,
            receiver: userToAdd._id,
        });

        await newRequest.save();
        return res.status(200).json({ message: 'Friend request sent' });
    } catch (error) {
        console.error('Error sending friend request:', error);
        return res.status(500).json({ error: 'Error sending friend request' });
    }
});

// Route pour récupérer les demandes envoyées par l'utilisateur
router.get('/sentRequests', verifyAuth, async (req, res) => {
    try {
        // Récupère l'ID de l'utilisateur à partir du token
        const username = req.user.username; 
        const user = await User.findOne({username: username});

        // Récupérer les demandes envoyées par l'utilisateur
        const sentRequests = await FriendRequest.find({ sender: user._id, status: 'pending' })
            .populate('receiver', 'username')
            .exec();

        // Ne renvoyer que le username du receiver dans la réponse
        const simplifiedRequests = sentRequests.map(request => ({
            _id: request._id,
            receiver: request.receiver.username, // Seul le username du destinataire
            status: request.status
        }));

        res.json(simplifiedRequests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching sent requests' });
    }
});

// Route pour récupérer les demandes reçues par l'utilisateur
router.get('/receivedRequests', verifyAuth, async (req, res) => {
    try {
        // Récupère l'ID de l'utilisateur à partir du token
        const username = req.user.username;
        const user = await User.findOne({username: username});

        // Récupérer les demandes reçues par l'utilisateur
        const receivedRequests = await FriendRequest.find({ receiver: user._id, status: 'pending' })
            .populate('sender', 'username')
            .exec();

        // Ne renvoyer que le username du receiver dans la réponse
        const simplifiedRequests = receivedRequests.map(request => ({
            _id: request._id,
            sender: request.sender.username, // Seul le username du destinataire
            status: request.status
        }));

        res.json(simplifiedRequests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching received requests' });
    }
});

router.post('/acceptFriendRequest', verifyAuth, async (req, res) => {
    const { requestId } = req.body;

    try {
        const io = req.app.get('socketio');
        const friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest) {
            return res.status(404).json({ error: 'Request not found' });
        }

        friendRequest.status = 'accepted';
        await friendRequest.save();

        // Add friend to both users
        const sender = await User.findById(friendRequest.sender);
        const receiver = await User.findById(friendRequest.receiver);

        sender.friends.push(receiver._id);
        receiver.friends.push(sender._id);

        await sender.save();
        await receiver.save();
 
         // Émettre un événement Socket.IO aux deux utilisateurs concernés
         const senderSocketId = users.getUser(sender._id.toString());
         if (senderSocketId) {
            io.to(senderSocketId).emit('friendAdded', { friendId: receiver._id.toString(), friendName: receiver.username });
          }
    
        res.status(200).json({ message: 'Friend request accepted' });
    } catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).json({ error: 'Error accepting friend request' });
    }
});

router.post('/rejectFriendRequest', verifyAuth, async (req, res) => {
    const { requestId } = req.body;

    try {
        const friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (friendRequest.receiver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'You cannot reject this request' });
        }

        friendRequest.status = 'rejected';
        await friendRequest.save();

        // Émettre un événement Socket.IO à l'expéditeur pour rafraîchir la liste
        const senderSocket = users.getUser(friendRequest.sender);
        if (senderSocket) {
            senderSocket.emit('friendListUpdated');
        }

        res.status(200).json({ message: 'Friend request rejected' });
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        res.status(500).json({ error: 'Error rejecting friend request' });
    }
});

router.post('/deleteFriend', verifyAuth, async (req, res) => {
    const userDelete = req.body.username; // Nom d'utilisateur de l'ami à supprimer
    const currentUsername = req.user.username; // Nom d'utilisateur du user connecté

    try {
        // Recherche de l'ami à supprimer par son nom d'utilisateur
        const userToRemove = await User.findOne({ username: userDelete });
        if (!userToRemove) {
            return res.status(404).json({ error: 'Ami non trouvé' });
        } 

        // Recherche du user actuel (connecté) par son nom d'utilisateur
        const currentUser = await User.findOne({ username: currentUsername });
        if (!currentUser) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Vérifie si l'ami est déjà dans la liste d'amis
        const friendIndex = currentUser.friends.indexOf(userToRemove._id);
        if (friendIndex === -1) {
            return res.status(400).json({ message: "Cet utilisateur n'est pas dans votre liste d'amis" });
        }

        // Supprime l'ami de la liste
        currentUser.friends.splice(friendIndex, 1);
        await currentUser.save();

        // Suppression de la demande d'ami entre les deux utilisateurs (si elle existe)
        await FriendRequest.deleteOne({
            $or: [
                { sender: currentUser._id, receiver: userToRemove._id },
                { sender: userToRemove._id, receiver: currentUser._id }
            ]
        });

        return res.status(200).json({ message: 'Ami supprimé avec succès', user: userToRemove });
    } catch (error) {
        return res.status(500).json({ error: 'Erreur lors de la suppression de l’ami' });
    }
});


module.exports = router;

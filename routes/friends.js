const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const verifyAuth = require('../middleware/authMiddleware');


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

router.post('/addFriend', verifyAuth, async (req, res) => {
    const usernameFriend = req.body.username;
    const usernameCurrent = req.user.username;
    
    try {
        // Find the user to be added by username
        const userToAdd = await User.findOne({ username: usernameFriend });
        if (!userToAdd) {
            return res.status(404).json({ error: 'User not found' });
        } 
 
        // Find the current user based on the verified token
        const currentUser = await User.findOne({ username: usernameCurrent }); 
        if (!currentUser) {
            return res.status(404).json({ error: 'Current user not found' });
        }

        if(currentUser.username === userToAdd.username){
            return res.status(400).json({ message: 'You cannot add yourself as a friend' });
        }
        console.log("req.user",req.user);
        console.log("current",currentUser);
        console.log("friends",currentUser.friends);
        console.log("userToAdd",userToAdd._id); 

        // Check if the friend is already in the list
        if (!currentUser.friends.includes(userToAdd._id)) {
            // Push the userToAdd's ObjectId into the friends list
            currentUser.friends.push(userToAdd._id);
            await currentUser.save();
            return res.status(200).json({ message: 'Friend added', user: userToAdd });
        } else {
            return res.status(400).json({ message: 'Friend already added' });
        }

    } catch (error) {
        console.error('Error adding friend:', error);
        return res.status(500).json({ error: 'Error adding friend' });
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

        return res.status(200).json({ message: 'Ami supprimé avec succès', user: userToRemove });
    } catch (error) {
        return res.status(500).json({ error: 'Erreur lors de la suppression de l’ami' });
    }
});


module.exports = router;

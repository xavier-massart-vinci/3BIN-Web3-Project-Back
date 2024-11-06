const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const verifyAuth = require('../middleware/authMiddleware');

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
    const { username1 } = req.body;
    const {username} = req.user;
    
    try {
        // Find the user to be added by username
        const userToAdd = await User.findOne({ username1 });
        if (!userToAdd) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find the current user based on the verified token
        const currentUser = await User.findOne({username});
        if (!currentUser) {
            return res.status(404).json({ error: 'Current user not found' });
        }

        // Ensure friends array is initialized
        currentUser.friends = currentUser.friends || [];
 
        // Check if the friend is already in the list
        if (!currentUser.friends.includes(userToAdd._id)) {
            // Push the userToAdd's ObjectId into the friends list
            currentUser.friends.push(userToAdd._id);
            await currentUser.save();
            return res.status(200).json({ message: 'Friend added', user: userToAdd });
        } else {
            return res.status(400).json({ error: 'Friend already added' });
        }

    } catch (error) {
        console.error('Error adding friend:', error);
        return res.status(500).json({ error: 'Error adding friend' });
    }
});



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



module.exports = router;

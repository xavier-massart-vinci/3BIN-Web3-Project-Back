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
    const {username} = req.body;
    try {
        const userToAdd = await User.findOne({username});
        if(!userToAdd){
            return res.sendStatus(404).json({error: 'User not found'});
        }
        const currentUser =req.user;
        if (!currentUser.friends.includes(userToAdd.id.toString())) {
            currentUser.friends.push(userToAdd.id.toString());
            await currentUser.save();
        }
        res.status(200).json({message: 'Friend added', user: userToAdd});
    } catch(error){
        return res.sendStatus(500).json({error: 'Error adding friend'});
    }
});


router.get('/getFriends', verifyAuth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        const friends = await User.find({ _id: { $in: currentUser.friends } });
        res.status(200).json(friends);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching friends list' });
    }
});



module.exports = router;

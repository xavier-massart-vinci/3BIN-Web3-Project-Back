const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const FriendRequest = require('../models/FriendsRequest');
const { users } = require("../services/usersSocket");
const verifyAuth = require('../middleware/authAPIMiddleware');
 
// Route to get the friends list of the current user
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

// Route to search for users by username
router.get('/search', verifyAuth, async (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.sendStatus(400);
    }
    try {
        const users = await User.find({ username: { $regex: username, $options: 'i' } });
        return res.status(200).json(users);
    } catch {
        return res.sendStatus(500).json({ error: 'Error searching users' });
    }
});

// Route to send a friend request to another user
router.post('/sendFriendRequest', verifyAuth, async (req, res) => {
    const currentUsername = req.user.username;
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

// Route to retrieve friend requests sent by the user
router.get('/sentRequests', verifyAuth, async (req, res) => {
    try {
        // Get user ID from the token
        const username = req.user.username;
        const user = await User.findOne({ username: username });

        // Retrieve requests sent by the user
        const sentRequests = await FriendRequest.find({ sender: user._id, status: { $in: ['pending', 'rejected']} })
            .populate('receiver', 'username')
            .exec();

        // Only return the username of the receiver in the response
        const simplifiedRequests = sentRequests.map(request => ({
            _id: request._id,
            receiver: request.receiver.username,
            status: request.status
        }));

        res.json(simplifiedRequests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching sent requests' });
    }
});

// Route to retrieve friend requests received by the user
router.get('/receivedRequests', verifyAuth, async (req, res) => {
    try {
        // Get user ID from the token
        const username = req.user.username;
        const user = await User.findOne({ username: username });

        // Retrieve requests received by the user
        const receivedRequests = await FriendRequest.find({ receiver: user._id, status: 'pending'})
            .populate('sender', 'username')
            .exec();

        // Only return the username of the sender in the response
        const simplifiedRequests = receivedRequests.map(request => ({
            _id: request._id,
            sender: request.sender.username,
            status: request.status
        }));

        res.json(simplifiedRequests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching received requests' });
    }
});

// Route to accept a friend request
router.post('/acceptFriendRequest', verifyAuth, async (req, res) => {
    const { requestId } = req.body; // Id of the friendRequest to accept

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

        // Emit a Socket.IO event to both users
        const senderSocketId = users.getUser(sender._id.toString());
        if (senderSocketId) {
            io.to(senderSocketId).emit('friendAdded');
        }

        res.status(200).json({ message: 'Friend request accepted' });
    } catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).json({ error: 'Error accepting friend request' });
    }
});

// Route to reject a friend request
router.post('/rejectFriendRequest', verifyAuth, async (req, res) => {
    const { requestId } = req.body;

    try {
        const io = req.app.get('socketio');
        const friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest) {
            return res.status(404).json({ error: 'Request not found' });
        }

        friendRequest.status = 'rejected';
        await friendRequest.save();

        // Emit a Socket.IO event to the sender to refresh the list
        const senderSocketId = users.getUser(friendRequest.sender._id.toString());
        if (senderSocketId) {
            io.to(senderSocketId).emit('friendRequestRejected');
        }

        res.status(200).json({ message: 'Friend request rejected' });
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        res.status(500).json({ error: 'Error rejecting friend request' });
    }
});

// Route to delete a friend
router.post('/deleteFriend', verifyAuth, async (req, res) => {
    const userDelete = req.body.username; // Username of the friend to delete
    const currentUsername = req.user.username; // Username of the logged-in user

    try {
        // Find the friend to delete by their username
        const userToRemove = await User.findOne({ username: userDelete });
        if (!userToRemove) {
            return res.status(404).json({ error: 'Friend not found' });
        }

        // Find the current user by their username
        const currentUser = await User.findOne({ username: currentUsername });
        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the friend is already in the friends list
        const friendIndex = currentUser.friends.indexOf(userToRemove._id);
        if (friendIndex === -1) {
            return res.status(400).json({ message: 'This user is not in your friends list' });
        }

        // Remove the friend from the list
        currentUser.friends.splice(friendIndex, 1);
        await currentUser.save();

        // Delete any friend request between the two users (if it exists)
        await FriendRequest.deleteOne({
            $or: [
                { sender: currentUser._id, receiver: userToRemove._id },
                { sender: userToRemove._id, receiver: currentUser._id }
            ]
        });

        return res.status(200).json({ message: 'Friend successfully removed', user: userToRemove });
    } catch (error) {
        return res.status(500).json({ error: 'Error removing friend' });
    }
});

module.exports = router;
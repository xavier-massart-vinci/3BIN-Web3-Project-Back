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
        const users = await User.find({ username: { $regex: username, $options: 'i' } }).limit(5);;
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
        const io = req.app.get('socketio');

        const currentUser = await User.findOne({ username: currentUsername });
        const userToAdd = await User.findOne({ username: friendUsername });

        if (!currentUser || !userToAdd) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (currentUser.username === userToAdd.username) {
            return res.status(400).json({ error: 'You cannot send a friend request to yourself' });
        }

        // Check if request already exists for sender
        const existingRequestForSender = await FriendRequest.findOne({
            sender: currentUser._id,
            receiver: userToAdd._id,
        });

        if (existingRequestForSender) {
            return res.status(400).json({ error: 'Friend request already sent' });
        }

        // Check if request already exists for receiver
        const existingRequestForReceiver = await FriendRequest.findOne({
            sender: userToAdd._id,
            receiver: currentUser._id,
        });

        if (existingRequestForReceiver) {
            return res.status(400).json({ error: 'Friend request already received' });
        }

        const newRequest = new FriendRequest({
            sender: currentUser._id,
            receiver: userToAdd._id,
        });

        await newRequest.save();

        const receiverSocketId = users.getUser(userToAdd._id.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('friendRequestReceived');
        }

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
        const sentRequests = await FriendRequest.find({ sender: user._id })
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
        const receivedRequests = await FriendRequest.find({ receiver: user._id})
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
            return res.status(404).json({ error: 'Requested friend not found' });
        }

        // Add friend to both users
        const sender = await User.findById(friendRequest.sender);
        const receiver = await User.findById(friendRequest.receiver);

        sender.friends.push(receiver._id);
        receiver.friends.push(sender._id);

        await sender.save();
        await receiver.save();

        await FriendRequest.deleteOne({
            $or: [
                { sender: friendRequest.sender, receiver: friendRequest.receiver },
                { sender: friendRequest.receiver, receiver: friendRequest.sender }
            ]
        });

        // Emit a Socket.IO event to both users
        const senderSocketId = users.getUser(sender._id.toString());
        console.log(senderSocketId);
        if (senderSocketId) {
            io.to(senderSocketId).emit('friendAdded');
            io.to(senderSocketId).emit('friendRequestRejectedOrAccepted');
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

        await FriendRequest.deleteOne({
            $or: [
                { sender: friendRequest.sender, receiver: friendRequest.receiver },
                { sender: friendRequest.receiver, receiver: friendRequest.sender }
            ]
        });

        // Emit a Socket.IO event to the sender to refresh the list
        const senderSocketId = users.getUser(friendRequest.sender._id.toString());
        if (senderSocketId) {
            io.to(senderSocketId).emit('friendRequestRejectedOrAccepted');
        }

        res.status(200).json({ message: 'Friend request rejected' });
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        res.status(500).json({ error: 'Error rejecting friend request' });
    }
});

// Route to delete a friend
router.post('/deleteFriend', verifyAuth, async (req, res) => {
    const friendUsername = req.body.username; // Username of the friend to delete
    const currentUsername = req.user.username; // Username of the logged-in user

    try {
        const io = req.app.get('socketio');

        // Find the friend to delete by their username
        const friendUser = await User.findOne({ username: friendUsername });
        if (!friendUser) {
            return res.status(404).json({ error: 'Friend not found' });
        }

        // Find the current user by their username
        const currentUser = await User.findOne({ username: currentUsername });
        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the friend is in the current user's friends list and if  the current is in the friend's friends list
        const friendUserIndex = currentUser.friends.indexOf(friendUser._id);
        const currentUserIndex = friendUser.friends.indexOf(currentUser._id);

        if (friendUserIndex === -1 || currentUserIndex === -1) {
            return res.status(400).json({ message: 'This user is not in your friends list or you are not in his friend list' });
        }

        // Remove the friend from the current user's list
        currentUser.friends.splice(friendUserIndex, 1);
        await currentUser.save();

        // Remove the current user from the friend's list
        friendUser.friends.splice(currentUserIndex, 1);
        await friendUser.save();

        // Delete any friend request between the two users (if it exists)
        await FriendRequest.deleteOne({
            $or: [
                { sender: currentUser._id, receiver: friendUser._id },
                { sender: friendUser._id, receiver: currentUser._id }
            ]
        });

        const friendSocketId = users.getUser(friendUser._id.toString());
        if (friendSocketId) {
            io.to(friendSocketId).emit('friendRemoved');
        }

        return res.status(200).json({ message: 'Friend successfully removed', user: friendUser });
    } catch (error) {
        return res.status(500).json({ error: 'Error removing friend' });
    }
});

// Route to cancel a sent friend request
router.post('/cancelFriendRequest', verifyAuth, async (req, res) => {
    const { requestId } = req.body; // Id of the friendRequest to cancel

    try {
        const io = req.app.get('socketio');

        // Find the friend request to cancel
        const friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest) {
            return res.status(404).json({ error: 'Friend request not found' });
        }

        const currentUser = await User.findOne({ username: req.user.username });
        if (!currentUser) {
            return res.status(404).json({ error: 'Current user not found' });
        }

        // Check if the user is the sender of the request
        if (friendRequest.sender.toString() !== currentUser._id.toString()) {
            return res.status(403).json({ error: 'You are not authorized to cancel this request' });
        }

        // Delete the friend request
        await FriendRequest.findByIdAndDelete(requestId);

        // Emit a Socket.IO event to the receiver to refresh the list
        const receiverSocketId = users.getUser(friendRequest.receiver.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('friendRequestCanceled');
        }

        res.status(200).json({ message: 'Friend request canceled successfully' });
    } catch (error) {
        console.error('Error canceling friend request:', error);
        res.status(500).json({ error: 'Error canceling friend request' });
    }
});


module.exports = router;

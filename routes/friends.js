const express = require('express');
const router = express.Router();
const { searchUsers, addFriend, getFriends } = require('../controllers/friendsController');

router.get('/friend/searchUsers', searchUsers);
router.post('/friend/addFriend', addFriend);
router.get('/friend/getFriends', getFriends);

module.exports = router;

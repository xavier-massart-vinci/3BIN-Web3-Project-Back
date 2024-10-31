const usersMock = [
    { id: 1, username: 'JohnDoe', friends: [2,3] },
    { id: 2, username: 'JaneDoe', friends: [1]},
    { id: 3, username: 'User123', friends: []},
];


const getUserById = (id) => usersMock.find(user => user.id === id);
const getUserByUsername = (username) => usersMock.find(user => user.username === username);

const searchUsers = async (req, res) => {
    const { username } = req.query;
    try {
        const results = usersMock.filter(user => user.username.toLowerCase().includes(username.toLowerCase())).slice(0, 10);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error searching users' });
    }
};

const addFriend = async (req, res) => {
    const { username } = req.body;
    const user = getUserByUsername(username);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = usersMock[0];  // Mock current user, assuming the first user is logged in
    if (!currentUser.friends.includes(user.id)) {
        currentUser.friends.push(user.id);
    }
    res.status(200).json({ message: 'Friend added (mock)', currentUser });
};

const getFriends = async (req, res) => {
    const currentUser = usersMock[0];  // Mock current user, assuming the first user is logged in
    const friendsList = currentUser.friends.map(id => getUserById(id));
    res.status(200).json(friendsList);
};

module.exports = {
    searchUsers,
    addFriend,
    getFriends,
};

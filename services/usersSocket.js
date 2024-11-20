let users = new Map();

users.addUser = function (userId, socketId) {
  users.set(userId, socketId);
};

users.removeUser = function (userId) {
  users.delete(userId);
};

users.getUser = function (userId) {
  return users.get(userId);
};

module.exports = { users };

const jwt = require('jsonwebtoken');

const authSocketMiddleware = (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(new Error('Authentication error'));
        }
        socket.user = { username: user.username };
        next();
    });
};

module.exports = authSocketMiddleware;
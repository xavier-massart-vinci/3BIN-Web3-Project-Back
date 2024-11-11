const { v4: uuidv4 } = require('uuid');



const messageSocketMiddleware = (socket, next) => {
    socket.use((packet, next) => { const message = packet[1]; 
        if (!message || typeof message !== 'object'
            || !message.from 
            || !message.to 
            || !message.text
            || typeof message.content === 'string'
            || typeof message.from !== 'string' 
            || typeof message.to !== 'string'
        ) {
             return next(new Error('Invalid message format')); 
        } 
        message.id = uuidv4();
        message.time = new Date().toISOString(); next(); 
    });
}

module.exports = messageSocketMiddleware;
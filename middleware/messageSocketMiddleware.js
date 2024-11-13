const { v4: uuidv4 } = require('uuid');

const validMessage = (message) => {
    return message 
        && typeof message === 'object'
        && typeof message.content === 'string'
        && typeof message.from === 'string' 
        && typeof message.to === 'int'
        && typeof message.type === 'string';
}

const modifyMessageForSecurity = (message) => {
    message.id = uuidv4();
    message.time = new Date().toISOString();
    return message;
}

const messageSocketMiddleware = (socket, next) => {
        socket.use((packet, next) => {
            const [event, message] = packet;
    
            if (!validMessage(message)) {
                console.log(event, message);
                return new Error('Invalid message format');
            } 

            modifyMessageForSecurity(message);
        });

    return next();
}

module.exports = messageSocketMiddleware;
const { v4: uuidv4 } = require('uuid');

const validMessage = (message) => {
    return message 
        && typeof message === 'object'
        && typeof message.content === 'string'
        && typeof message.from === 'string' 
        && typeof message.to === 'string'
        && typeof message.toSocket === 'string'
        && typeof message.type === 'string'
        && message.content.length > 0
        && message.from.length > 0
        && message.to.length > 0
        && message.toSocket.length > 0
        && message.type.length > 0;
        
}

const modifyMessageForSecurity = (message) => {
    message.id = uuidv4();
    message.time = new Date().toISOString();
    return message;
}

const messageSocketMiddleware = (socket, next) => {
        socket.use((packet, next) => {
            const [event, message] = packet;
            
            if(event === 'chatHistory') {
                return next();
            }


            if (!validMessage(message)) {
                return new Error('Invalid message format');
            } 
            modifyMessageForSecurity(message);
            return next();
        });

    return next();
}

module.exports = messageSocketMiddleware;
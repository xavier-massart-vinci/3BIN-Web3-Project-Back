require('dotenv').config()
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const connect = async () => {
    try {
        const url = process.env.MONGODB;
        console.log('Connecting to MongoDB:', url);

        await mongoose.connect(url);
        console.log('Connected to MongoDB successfully.');
        
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
    }
};


module.exports = connect;
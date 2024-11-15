require('dotenv').config()
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const url = process.env.MONGODB

const connect = () => {
    mongoose.connect(url)
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
        process.exit(1);
    })
}

module.exports = connect;
require('dotenv').config()
const mongoose = require('mongoose')


mongoose.set('strictQuery', false)
const url = process.env.MONGODB



const connect = () => {
    mongoose.connect(url)
    .then(result => {
        return mongoose
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
        return null;
    })
}


module.exports = connect;
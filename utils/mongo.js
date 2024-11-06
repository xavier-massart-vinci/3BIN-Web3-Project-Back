require('dotenv').config()
const mongoose = require('mongoose')

const url = process.env.MONGODB
mongoose.set('strictQuery', false)

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
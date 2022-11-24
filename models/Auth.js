const mongoose = require('mongoose')

const AuthSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    email: String,
    password: String
})

module.exports = mongoose.model('Auth',AuthSchema)
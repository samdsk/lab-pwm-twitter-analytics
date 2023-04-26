const mongoose = require('mongoose')

// Schema for Auth
const AuthSchema = new mongoose.Schema({
    _id:{type:mongoose.Schema.Types.ObjectId},
    email: {
        type:String,
        required:true,
        unique:true,
        dropDups: true
    },
    password: {type:String,required:true}
})

module.exports = mongoose.model('Auth',AuthSchema)
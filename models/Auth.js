const mongoose = require('mongoose')

const AuthSchema = new mongoose.Schema({
    _id:{type:mongoose.Schema.Types.ObjectId},
    email: {
        type:String,
        unique:true,
        required:true
    },
    password: {type:String,required:true}
})

module.exports = mongoose.model('Auth',AuthSchema)
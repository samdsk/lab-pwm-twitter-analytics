const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    _id:{ type: mongoose.Schema.Types.ObjectId, ref : 'Auth'},
    name: {type:String,required:true},
    searched: [{type: mongoose.Schema.Types.ObjectId, ref : 'SearchResults'}]
})

module.exports = mongoose.model('User',UserSchema)
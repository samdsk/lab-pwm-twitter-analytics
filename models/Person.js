const mongoose = require('mongoose')

const PersonSchema = new mongoose.Schema({
    _id:{ type: mongoose.Schema.Types.ObjectId, ref : 'Auth'},
    name: String,
    searched: [{type: mongoose.Schema.Types.ObjectId, ref : 'SearchResults'}]
})

module.exports = mongoose.model('Person',PersonSchema)
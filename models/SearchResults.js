const mongoose = require('mongoose')

const SeachResultsSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    tw_id: String,
    tw_username: String,
    tw_start_date : Date,
    tw_end_date : Date,
    tweets: {
        text: Number, //quanti tweets di tipo text
        link: Number, //quanti tweets di tipo link
        img: Number, //quanti tweets di tipo image
        video: Number //quanti tweets di tipo video
    },
    
    avg_metrics : {
        avg_post_interval : Number, //media degli intervalli temporali tra i tweet postati
        avg_retweets : Number, //media dei retweet tra i tweet postati
        avg_mentions : Numver, //media delle mention tra i tweet postati
        likes: Number, //media dei likes per post
        retweets: Number, //media dei retweets per post
        replies: Number //media delle risposte per post
    }
})

module.exports = mongoose.model('SearchResults',SeachResultsSchema)
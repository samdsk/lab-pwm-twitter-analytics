const mongoose = require('mongoose')

const SeachResultsSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    tw_id: {type:String,unique:true,required:true},
    tw_username: String,
    tw_start_date : Date,
    tw_end_date : Date,
    tweets: {
        text: {type:Number,default:0}, //quanti tweets di tipo text
        link: {type:Number,default:0}, //quanti tweets di tipo link
        img: {type:Number,default:0}, //quanti tweets di tipo image
        video: {type:Number,default:0} //quanti tweets di tipo video
    },
    
    avg_metrics : {
        avg_post_interval : {type:Number,default:0}, //media degli intervalli temporali tra i tweet postati
        avg_retweets : {type:Number,default:0}, //media dei retweet tra i tweet postati
        avg_mentions : {type:Number,default:0}, //media delle mention tra i tweet postati
        likes: {type:Number,default:0}, //media dei likes per post
        retweets: {type:Number,default:0}, //media dei retweets per post
        replies: {type:Number,default:0} //media delle risposte per post
    }
})

module.exports = mongoose.model('SearchResults',SeachResultsSchema)
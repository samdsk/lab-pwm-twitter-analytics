const mongoose = require('mongoose')

const SeachResultsSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    id: {type:String,unique:true,required:true},
    username: String,
    start_date : Date,
    end_date : Date,
    followings: {type:Number,default:0},
    followers: {type:Number,default:0},
    tweets_by_type: {
        text: {type:Number,default:0}, // text tweets count 
        polls: {type:Number,default:0}, // poll tweets count 
        link: {type:Number,default:0}, // link tweets count 
        photo: {type:Number,default:0}, // photo tweets count 
        video: {type:Number,default:0}, // video tweets count 
        mentions : {type:Number,default:0}, //mentions count
    },
    highlights : {
        retweets : {type:Number,default:0}, // tweet with most retweets
        replies : {type:Number,default:0}, // tweet with most replies
        likes : {type:Number,default:0}, // tweet with most likes
        impressions : {type:Number,default:0}, // tweet with most impressions
    },
    
    metrics : {
        posts : {type:Number,default:0}, // total posts
        post_interval : {type:Number,default:0}, // avg interval of posts
        retweets : {type:Number,default:0}, // retweets count
        retweets_interval : {type:Number,default:0}, //avg interval of retweets
        likes: {type:Number,default:0}, // avg likes per tweet
        quotes : {type:Number,default:0}, // quotes count
        quotes_interval : {type:Number,default:0}, // avg interval of quotes
        replies: {type:Number,default:0}, // reply count
        replies_interval: {type:Number,default:0}, // avg interval of replies
        original : {type:Number,default:0}, // original tweet count
        original_interval : {type:Number,default:0}, // avg interval of original posts
    },

})

module.exports = mongoose.model('SearchResults',SeachResultsSchema)
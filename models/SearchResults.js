const mongoose = require('mongoose')

const SeachResultsSchema = new mongoose.Schema({
    _id:{type:mongoose.Schema.Types.ObjectId},
    date : {type:Date,required:true},
    name : {type:String,required:true},
    user_img :{type:String},
    user_id: {type:String,required:true},
    username: {type:String,required:true},
    start_date : {type:Date,required:true},
    end_date : {type:Date,required:true},
    followings: {type:Number,default:0},
    followers: {type:Number,default:0},
    total_tweets: {type:Number,default:0},

    tweets_by_type: {
        text: {type:Number,default:0}, // text tweets count 
        polls: {type:Number,default:0}, // poll tweets count 
        link: {type:Number,default:0}, // link tweets count 
        photo: {type:Number,default:0}, // photo tweets count 
        video: {type:Number,default:0}, // video tweets count 
        mentions : {type:Number,default:0}, //mentions count
        animated_gifs : {type:Number,default:0}, // gif tweets count
    },

    highlights : {
        retweet_count : {
            id : {type:Number,default:0},
            count : {type:String},
        }, // tweet with most retweets
        reply_count : {
            id : {type:Number,default:0},
            count : {type:String},
        }, // tweet with most replies
        like_count : {
            id : {type:Number,default:0},
            count : {type:String},
        },
        quote_count : {
            id : {type:Number,default:0},
            count : {type:String},
        }, // tweet with most likes
        impression_count : {
            id : {type:Number,default:0},
            count : {type:String},
        }, // tweet with most impressions
    },
    
    metrics : {
        retweeted : {
            count : {type:Number,default:0},
            interval : {type:Number,default:0}
        }, // retweeted posts
        replied_to : {
            count : {type:Number,default:0},
            interval : {type:Number,default:0},
            metrics:{
                retweet_count:{type:Number,default:0},
                reply_count:{type:Number,default:0},
                like_count:{type:Number,default:0},
                quote_count:{type:Number,default:0},
                impression_count:{type:Number,default:0}
            }
        }, // reply posts
        quoted : {
            count : {type:Number,default:0},
            interval : {type:Number,default:0},
            metrics:{
                retweet_count:{type:Number,default:0},
                reply_count:{type:Number,default:0},
                like_count:{type:Number,default:0},
                quote_count:{type:Number,default:0},
                impression_count:{type:Number,default:0}
            }
        }, // quoted posts
        original : {
            count : {type:Number,default:0},
            interval : {type:Number,default:0},
            metrics:{
                retweet_count:{type:Number,default:0},
                reply_count:{type:Number,default:0},
                like_count:{type:Number,default:0},
                quote_count:{type:Number,default:0},
                impression_count:{type:Number,default:0}
            }
        }, // original posts
        total : {
            count : {type:Number,default:0},
            interval : {type:Number,default:0},
            metrics:{
                retweet_count:[{type:Number,default:0}],
                reply_count:[{type:Number,default:0}],
                like_count:[{type:Number,default:0}],
                quote_count:[{type:Number,default:0}],
                impression_count:[{type:Number,default:0}]
            }
        }, // total posts
    },
    
})

module.exports = mongoose.model('SearchResults',SeachResultsSchema)
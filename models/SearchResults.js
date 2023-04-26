const mongoose = require('mongoose')

//Schema for search record
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
    mentions:{type:Number,default:0},
    mentioned_users:{type:Object,default:null},
    hashtags:{type:Object,default:null},
    langs:{type:Object,default:null},
    tweets_per_day:{type:Object,default:null},
    media_type: {
        text : {
            count : {type:Number,default:0},
            interval : {type:Number,default:0},
            metrics:{
                retweet_count:{type:Number,default:0},
                reply_count:{type:Number,default:0},
                like_count:{type:Number,default:0},
                quote_count:{type:Number,default:0},
                impression_count:{type:Number,default:0}
            }
        },
        video : {
            count : {type:Number,default:0},
            interval : {type:Number,default:0},
            metrics:{
                retweet_count:{type:Number,default:0},
                reply_count:{type:Number,default:0},
                like_count:{type:Number,default:0},
                quote_count:{type:Number,default:0},
                impression_count:{type:Number,default:0}
            }
        },
        photo : {
            count : {type:Number,default:0},
            interval : {type:Number,default:0},
            metrics:{
                retweet_count:{type:Number,default:0},
                reply_count:{type:Number,default:0},
                like_count:{type:Number,default:0},
                quote_count:{type:Number,default:0},
                impression_count:{type:Number,default:0}
            }
        },
        link : {
            count : {type:Number,default:0},
            interval : {type:Number,default:0},
            metrics:{
                retweet_count:{type:Number,default:0},
                reply_count:{type:Number,default:0},
                like_count:{type:Number,default:0},
                quote_count:{type:Number,default:0},
                impression_count:{type:Number,default:0}
            }
        },
        polls : {
            count : {type:Number,default:0},
            interval : {type:Number,default:0},
            metrics:{
                retweet_count:{type:Number,default:0},
                reply_count:{type:Number,default:0},
                like_count:{type:Number,default:0},
                quote_count:{type:Number,default:0},
                impression_count:{type:Number,default:0}
            }
        },
        animated_gif : {
            count : {type:Number,default:0},
            interval : {type:Number,default:0},
            metrics:{
                retweet_count:{type:Number,default:0},
                reply_count:{type:Number,default:0},
                like_count:{type:Number,default:0},
                quote_count:{type:Number,default:0},
                impression_count:{type:Number,default:0}
            }
        }
    },
    highlights : {
        retweet_count : {
            id : {type:String,default:""},
            count : {type:String},
        }, // tweet with most retweets
        reply_count : {
            id : {type:String,default:""},
            count : {type:String},
        }, // tweet with most replies
        like_count : {
            id : {type:String,default:""},
            count : {type:String},
        },// tweet with most likes
        quote_count : {
            id : {type:String,default:""},
            count : {type:String},
        }, // tweet with most quotes
        impression_count : {
            id : {type:String,default:""},
            count : {type:String},
        }, // tweet with most impressions
    },
    type : {
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

    },
    total : {// total posts
        count : {type:Number,default:0},
        interval : {type:Number,default:0},
        metrics : {
            retweet_count:{type:Number,default:0},
            reply_count:{type:Number,default:0},
            like_count:{type:Number,default:0},
            quote_count:{type:Number,default:0},
            impression_count:{type:Number,default:0}
        }
    }

})

module.exports = mongoose.model('SearchResults',SeachResultsSchema)
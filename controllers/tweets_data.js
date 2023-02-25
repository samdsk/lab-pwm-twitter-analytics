const TWEETS = {
    _id:null,
    user_id:null,
    username:null,
    start_date:null,
    end_date:null,
    followings:0,
    followers:0,

    tweets_by_type:{
        text:0,
        video:0,
        photo:0,
        link:0,
        polls:0,
        animated_gif:0,
    },

    higlights:{
        retweet_count:{id:null,count:0},
        reply_count:{id:null,count:0},
        like_count:{id:null,count:0},
        quote_count:{id:null,count:0},
        impression_count:{id:null,count:0}
    },

    metrics: {    
        retweeted:{
            count : 0,
            last : 0,
            interval : 0
        },
        replied_to:{
            count : 0,
            last : 0,
            interval : 0,
            metrics:{
                retweet_count:0,
                reply_count:0,
                like_count:0,
                quote_count:0,
                impression_count:0
            }
        },
        quoted:{
            count : 0,
            last : 0,
            interval : 0,
            metrics:{
                retweet_count:0,
                reply_count:0,
                like_count:0,
                quote_count:0,
                impression_count:0
            }
        },
        original:{
            count : 0,
            last : 0,
            interval : 0,
            metrics:{
                retweet_count:0,
                reply_count:0,
                like_count:0,
                quote_count:0,
                impression_count:0
            }
        },
        total : {
            count : 0,
            last : 0,
            interval : 0,
            metrics:{
                retweet_count:0,
                reply_count:0,
                like_count:0,
                quote_count:0,
                impression_count:0
            }
        }
    }
}

module.exports = TWEETS
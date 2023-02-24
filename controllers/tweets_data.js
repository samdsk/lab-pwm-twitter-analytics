const TWEETS = {
    text:0,
    video:0,
    photo:0,
    link:0,
    polls:0,
    animated_gif:0,
    higlights:{
        retweet_count:{id:null,count:0},
        reply_count:{id:null,count:0},
        like_count:{id:null,count:0},
        quote_count:{id:null,count:0},
        impression_count:{id:null,count:0}
    },
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
    }
}

module.exports = TWEETS
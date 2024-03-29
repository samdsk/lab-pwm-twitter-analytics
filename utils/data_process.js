const fs = require('fs')
const pathToJsonObj = "./tweets_data.json"

// Parse data received from Twitter API and returns a JSON obj
const collectData = async (DATA) => {

    let jsonObj = fs.readFileSync(require.resolve(pathToJsonObj),"utf-8")
    const TWEETS = JSON.parse(jsonObj)

    let data = DATA._realData.data

    if(data.length<1) throw new Error("There's no recent data for "+((DATA._queryParams.query).split(":")[1]))

    let media = DATA._realData.includes?.media

    TWEETS.limit = DATA._rateLimit

    // sort tweets in ascending order
    data = data.sort((a,b) => {if(a.created_at > b.created_at) return 1 ;else return -1})

    // console.log(">>> TWEETS ",TWEETS);

    // collect how many tweets of media type and type per day
    const tweets_per_day = {}

    TWEETS.start_date = new Date(Date.parse(data[0].created_at))
    TWEETS.end_date = new Date(Date.parse(data[data.length-1].created_at))
    let temp_end = new Date(Date.parse(TWEETS.end_date))
    let temp_date = new Date(temp_end)

    temp_date.setDate(temp_end.getDate()-7)
    temp_end.setDate(temp_end.getDate())
    TWEETS.interval = temp_end.getTime() - temp_date.getTime()

    while(temp_date<=temp_end){

        let date = temp_date.toISOString().split('T')[0]
        tweets_per_day[date] = {
            media:{
                text:0,
                video:0,
                photo:0,
                link:0,
                polls:0,
                animated_gif:0
            },
            type:{
                retweeted:0,
                replied_to:0,
                quoted:0,
                original:0,
            }
        }

        temp_date.setDate(temp_date.getDate() + 1)
    }

    let interval_start_time = new Date(Date.parse(TWEETS.start_date)).getTime()
    // process each tweet finding media type, tweet type, time intervals and metrics

    // collect metioned users
    const mentioned_users = {}

    // collect used hashtags
    const hashtags = {}

    // collect used langs
    const lang = {}

    data.forEach(e => {

        // section - count post media types
        let mediaType = findMediaType(media,e)
        let type = findTweetType(e)

        let time = new Date(Date.parse(e.created_at))
        let date = e.created_at.split('T')[0]

        lang[e.lang] = (lang[e.lang] || 0)+1

        e?.entities?.mentions?.forEach( mention => {
            mention = '@'+mention.username
            mentioned_users[mention] = (mentioned_users [mention] || 0)+1
        })

        e?.entities?.hashtags?.forEach( hashtag => {
            let tag = '#'+hashtag.tag
            hashtags[tag] = (hashtags[tag] || 0)+1
        })

        // post media types: text,photo,video,link,polls,animated_gif
        // post subtypes: retweet, reply, quote, original
        // for each type except for retweets count public metrics and time interval between posts
        // interval accumulate the difference between two posts

        TWEETS.media_type[mediaType].count++
        TWEETS.type[type].count++
        TWEETS.total.count++

        tweets_per_day[date].media[mediaType]++
        tweets_per_day[date].type[type]++

        if(type != "retweeted"){
            updateMetrics(TWEETS.media_type,mediaType,e)
            updateMetrics(TWEETS.type,type,e)
            updateMetricsTotal(TWEETS,e)
        }

        // count total posts and interval between tweets
        updateInterval(TWEETS.total,time,interval_start_time)
    });

    TWEETS.tweets_per_day = tweets_per_day
    TWEETS.mentioned_users  = mentioned_users
    TWEETS.hashtags = hashtags
    TWEETS.langs = lang

    return TWEETS
}

// returns the Type of the given tweet data
function findTweetType(e){
    let type = undefined
    if(e?.referenced_tweets){
        type = (e?.referenced_tweets[0].type)
    }else{
        // if a post doesn't contain references means it's a original tweet from the user
        type = "original"
    }
    return type
}

// returns the Media Type of the given tweet data
function findMediaType(media,e){
    let mediaType = undefined
    if(media && e.attachments?.media_keys){
        mediaType = media.find(m => m.media_key == e.attachments?.media_keys[0])?.type
    }else if(e?.entities?.urls && e.entities.urls[0].unwound_url) {// posts with links
        mediaType = "link"
    }else if(e?.entities?.polls) {// posts with polls
        mediaType = "polls"
    }else{
        mediaType = "text"
    }

    return mediaType
}

// calculate intervals by dividing the accumulated interval by count for each subtype
// requires TWEETS data type
function avgInterval(data,interval){
    Object.keys(data).forEach( key => {
        data[key].interval = calcAvg(data[key].count,interval)
    })
    delete data.last
}

// calculate the average interval of total tweets
function avgIntervalTotal(data,interval){
    data.interval = calcAvg(data.count,interval)
    delete data.last
}

// returns 0 if count == 0 otherwise returns sum / count
function calcAvg(count,sum) {
    if(count == 0) return 0
    return Math.floor(sum/count)
}

// accumulate public metrics for each type
function updateMetrics(data,type,e){
    Object.keys(data[type].metrics).forEach(key => {
        data[type].metrics[key] += e.public_metrics[key];
    })
}

// update metrics for total tweets
function updateMetricsTotal(data,e){
    let total = data.total.metrics
    Object.keys(total).forEach(key => {
        total[key] += e.public_metrics[key]
        updateHighlights(data,key,e)
    })
}

// compare current post with new post for most retweets, replies, likes, impressions
// updates if this tweet metrics >= old metrics update otherwise not
function updateHighlights(data,key,e){
    if(data.highlights[key].count == 0)
        data.highlights[key] = {id:e.id,count:e.public_metrics[key]}
    else if(data.highlights[key].count < e.public_metrics[key])
        data.highlights[key] = {id:e.id,count:e.public_metrics[key]}
}

// update interval for the given type
function updateInterval(data,time,interval_start_time){
    if(data.last == 0){
        data.interval = time - interval_start_time
    }else{
        data.interval += time - data.last
    }
    data.last = time
}

// converts from miliseconds to H:m:s
/* function msToHMS(e) {
    let s = e/1000;
    let m = s/60;
    s = s%60;
    let h = m/60;
    m = m%60;
    return [Math.floor(h),Math.floor(m),Math.floor(s)]
} */

const process_data = (async (DATA) => {

    let data = await collectData(DATA).then( data => {
        avgInterval(data.media_type,data.interval)
        avgInterval(data.type,data.interval)
        avgIntervalTotal(data.total,data.interval)
        return data
    })

    return data
})

/* async function test(){
    let FILE = fs.readFileSync('../data.json')
    let data =  await collectData(JSON.parse(FILE)).then( data => {
        avgInterval(data.media_type,data.interval)
        avgInterval(data.type,data.interval)
        avgIntervalTotal(data.total,data.interval)
        return data
    })
    console.log(data);
} */

// test()

module.exports = process_data
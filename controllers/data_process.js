const fs = require('fs')
const pathToJsonObj = "./tweets_data.json"


const collectData = async (DATA) => { 
      
    DATA = JSON.parse(DATA)
    let jsonObj = fs.readFileSync(require.resolve(pathToJsonObj),"utf-8")
    const TWEETS = JSON.parse(jsonObj)

    let data = DATA._realData.data
    let media = DATA._realData.includes?.media
    
    // sort tweets in ascending order
    data = data.sort((a,b) => {if(a.created_at > b.created_at) return 1 ;else return -1})

    // console.log(">>> TWEETS ",TWEETS);

    TWEETS.start_date = data[0].created_at
    TWEETS.end_date = data[data.length-1].created_at
    // process each tweet finding media type, tweet type, time intervals and metrics
    data.forEach(e => {
        // count post types
        if(media && e.attachments?.media_keys){
            let found = media.find(m => m.media_key == e.attachments?.media_keys[0])            
            if(found) TWEETS.tweets_by_type[found.type] += 1
        }else{                
            TWEETS.tweets_by_type.text+=1
        }
        
        // posts with links
        if(e?.entities?.urls) {            
            if(e.entities.urls[0].unwound_url) {
                TWEETS.tweets_by_type.link += 1
            }
        }

        // posts with polls
        if(e?.entities?.polls) {            
            TWEETS.tweets_by_type.polls += 1
        }

        let time = new Date(Date.parse(e.created_at)).getTime()
        
        // post subtypes: retweet, reply, quote, original
        // for each type except for retweets count public metrics and time interval between posts
        // interval accumulate the difference between two posts
        if(e?.referenced_tweets){
            
            let type = (e?.referenced_tweets[0].type)
            updateInterval(TWEETS,type,time)
            if(type != "retweeted") {
                updateMetrics(TWEETS,type,e)
                updateMetrics(TWEETS,"total",e)
            }
            TWEETS.metrics[type].count +=1

        }else{
            // if a post doesn't contain references means it's a poriginal tweet from the user
            updateInterval(TWEETS,"original",time)
            updateMetrics(TWEETS,"total",e)
            updateMetrics(TWEETS,"original",e)
            TWEETS.metrics.original.count +=1
        }

        // count total posts and interval between tweets
        updateInterval(TWEETS,"total",time)
        
        TWEETS.metrics.total.count += 1;
    });

    return TWEETS
}

// calculate intervals by dividing the accumulated interval by count for each subtype
// requires TWEETS data type
function avgInterval(data){
    
    ["retweeted","replied_to","quoted","original","total"].forEach( (type) => {
        if(data.metrics[type]?.interval){
            // console.log(type," : ",data.metrics[type]);
            
            data.metrics[type].interval = Math.floor(data.metrics[type].interval / data.metrics[type].count)
        }

        delete data.metrics[type].last
    })

    return data
}

// accumulate public metrics for each type
function updateMetrics(data,type,e){
    Object.keys(data.metrics[type].metrics).forEach(key => {
        data.metrics[type].metrics[key] += e.public_metrics[key];
        updateHighlights(data,key,e)
    })
}

// compare current post with new post for most retweets, replies, likes, impressions
function updateHighlights(data,key,e){
    if(data.higlights[key].count == 0)
        data.higlights[key] = {id:e.id,count:e.public_metrics[key]}
    else if(data.higlights[key].count < e.public_metrics[key])
        data.higlights[key] = {id:e.id,count:e.public_metrics[key]}
}

// accumulate interval for the given type
function updateInterval(data,type,time){
    //console.log("here ",data);
    if(data.metrics[type].last == 0){
        data.metrics[type].last  = time
    }else{         
        data.metrics[type].interval += time - data.metrics[type].last
        data.metrics[type].last = time
    }
}

// converts from miliseconds to H:m:s
function msToHMS(e) {
    let s = e/1000;
    let m = s/60;
    s = s%60;
    let h = m/60;
    m = m%60;
    return [Math.floor(h),Math.floor(m),Math.floor(s)]
}

const process_data = (async (filename) => {

    let FILE = fs.readFileSync(filename)
    let data =  await collectData(FILE).then( data => {
        return avgInterval(data)
    })
    //console.log(data);
    return data
})

module.exports = process_data
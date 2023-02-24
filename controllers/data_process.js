const fs = require('fs')
const TWEETS = require('./tweets_data')


const collectData = async (DATA) => { 
      
    DATA = JSON.parse(DATA)

    let data = DATA._realData.data
    let media = DATA._realData.includes?.media
    
    // sort tweets in ascending order
    data = data.sort((a,b) => {if(a.created_at > b.created_at) return 1 ;else return -1})

    // process each tweet finding media type, tweet type, time intervals and metrics
    data.forEach(e => {

        if(media && e.attachments?.media_keys){
            let found = media.find(m => m.media_key == e.attachments?.media_keys[0])            
            if(found) TWEETS[found.type] += 1
        }else{                
            TWEETS.text+=1
        }
        
        if(e?.entities?.urls) {            
            if(e.entities.urls[0].unwound_url) {                
                //console.log("external url ",e.entities.urls[0].unwound_url); 
                TWEETS.link += 1
            }
        }

        if(e?.entities?.polls) {
            //console.log("poll ",e?.entities?.polls);
            TWEETS.polls += 1
        }

        let time = new Date(Date.parse(e.created_at)).getTime()
        
        if(e?.referenced_tweets){
            
            let type = (e?.referenced_tweets[0].type)
            updateInterval(TWEETS,type,time)
            if(type != "retweeted") updateMetrics(TWEETS,type,e)
            TWEETS[type].count +=1

        }else{

            updateInterval(TWEETS,"original",time)
            updateMetrics(TWEETS,"original",e)
            TWEETS.original.count +=1
        }

        updateInterval(TWEETS,"total",time)
        TWEETS.total.count += 1;
    });

    return TWEETS
}

function calculateIntervals(data){
    ["retweeted","replied_to","quoted","original"].forEach( (type) => {
        if(data[type]?.interval)
            data[type].interval = Math.floor(data[type].interval / data[type].count)
    })

    return data
}

function updateMetrics(data,type,e){
    Object.keys(data[type].metrics).forEach(key => {
        data[type].metrics[key] += e.public_metrics[key];
        updateHighlights(data,key,e)
    })
}

function updateHighlights(data,key,e){
    if(data.higlights[key].count == 0)
        data.higlights[key] = {id:e.id,count:e.public_metrics[key]}
    else if(data.higlights[key].count < e.public_metrics[key])
        data.higlights[key] = {id:e.id,count:e.public_metrics[key]}
}

function updateInterval(data,type,time){    
    if(data[type].last == 0){
        data[type].last  = time
    }else{         
        data[type].interval += time - data[type].last
        data[type].last = time
    }
}

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
        return calculateIntervals(data)
    })
    //console.log(data);
    return data
})

//process_data('../data.json')

module.exports = process_data
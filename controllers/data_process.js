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
                console.log("external url ",e.entities.urls[0].unwound_url); 
                TWEETS.links += 1
            }
        }

        if(e?.entities?.polls) {
            console.log("poll ",e?.entities?.polls);
            TWEETS.polls += 1
        }

        let time = new Date(Date.parse(e.created_at)).getTime()
        
        if(e?.referenced_tweets){
            
            let type = (e?.referenced_tweets[0].type)
            updateInterval(TWEETS,type,time)
            if(type != "retweeted") updateMetrics(TWEETS,type,e.public_metrics)
            TWEETS[type].count +=1

        }else{

            updateInterval(TWEETS,"original",time)
            updateMetrics(TWEETS,"original",e.public_metrics)
            TWEETS.original.count +=1
        }

    });

    return TWEETS
}

function calculateIntervals(data){
    ["retweeted","replied_to","quoted","original"].forEach( (type) => {
        if(data[type]?.interval)
            data[type].interval = msToHMS(data[type].interval / data[type].count)
    })

    return data
}

function updateMetrics(data,type,public_metrics){
    Object.keys(data[type].metrics).forEach(key => {
        data[type].metrics[key] += public_metrics[key];                
    })
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

const process_data = (async () => {

    let FILE = fs.readFileSync('../log.json')
    let d = await collectData(FILE).then( data => {
        return calculateIntervals(data)
    })

    //console.log(d);

    console.log(Object.create(TWEETS));
    
})()
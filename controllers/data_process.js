const fs = require('fs')

let TWEETS = {
    text: 0,
    video:0,
    photo:0,
    links:0,
    likes:{
        count : 0,
        avg : 0
    },
    retweeted:{
        count : 0,
        last : 0,
        interval : []
    },
    replied_to:{
        count : 0,
        last : 0,
        interval : []
    },
    quoted:{
        count : 0,
        last : 0,
        interval : []
    },
    original:{
        count : 0,
        last : 0,
        interval : []
    },
    total:{
        count : 0,
        last : 0,
        interval : []
    }
}

const process_data = async (DATA) => {        
        
    let FILE = fs.readFileSync('../log.json')
    FILE = JSON.parse(FILE)

    let data = FILE._realData.data
    let media = FILE._realData.includes?.media
    
    // sort tweets in ascending order
    data = data.sort((a,b) => {if(a.created_at > b.created_at) return 1 ;else return -1})

    // process each tweet finding media type, tweet type, time intervals
    data.forEach(e => {

        if(media && e.attachments?.media_keys){
            let found = media.find(m => m.media_key == e.attachments?.media_keys[0])            
            if(found) TWEETS[found.type] += 1
        }else{                
            TWEETS.text+=1
        }

        
        if(e?.entities?.urls) {
            if(e.entities.urls[0].unwound_url) {
                console.log(e.entities.urls[0].unwound_url); 
                TWEETS.links += 1}
        }
        
        let time = new Date(Date.parse(e.created_at)).getTime()
        
        if(e?.referenced_tweets){
            
            let type = (e?.referenced_tweets[0].type)

            if(TWEETS[type].last == 0){
                TWEETS[type].last = time
            }else{                        
                TWEETS[type]?.interval.push(time - TWEETS[type].last)
                TWEETS[type].last = time
            }

            TWEETS[type].count +=1

        }else{
            if(TWEETS.original.last == 0){
                TWEETS.original.last  = time
            }else{
                TWEETS.original?.interval.push(time - TWEETS.original.last)
                TWEETS.original.last
            }

            TWEETS.original.count +=1

        }

        if(TWEETS.total.last == 0){
            TWEETS.total.last = time
        }else{
            TWEETS.total?.interval.push(time - TWEETS.total.last)
            TWEETS.total.last = time
        }

        TWEETS.total.count += 1
    });

    console.log(TWEETS);
}

function msToHMS(e) {    
    let s = e/1000;
    let m = s/60;
    s = s%60;
    let h = m/60;
    m = m%60;
    return [Math.floor(h),Math.floor(m),Math.floor(s)]
}

process_data()
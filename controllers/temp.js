function isoStringToDate (s) {
    // var b = s.split(/[-t:.+]/ig);
    // console.log("splited "+b);
    // return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4],b[5]));
    return new Date(Date.parse(s));
}

const process_data = async (DATA) => {        
        
    let FILE = fs.readFileSync('../log.json')
    FILE = JSON.parse(FILE)

    let data = FILE._realData.data
    let media = FILE._realData.includes?.media

    // sort tweets in ascending order
    data = data.sort((a,b) => {if(a.created_at > b.created_at) return 1 ;else return -1})

    data.forEach(e => {
        if(media && e.attachments?.media_keys){
            let found = media.find(m => m.media_key == e.attachments?.media_keys[0])
            console.log(found)
            if(found) type_of_tweets[found.type] += 1
        }else{                
            type_of_tweets.text+=1
        }

        /*
        if(e?.entities?.urls) {
            if(e.entities.urls[0].unwound_url) {
                //console.log(e.entities.urls[0].unwound_url); 
                type_of_tweets.links += 1}
        }*/
        // console.log("created: "+e.created_at)
        let time = isoStringToDate(e.created_at).getTime()
        // console.log("time: ",time);
        if(e?.referenced_tweets){
            
            switch (e?.referenced_tweets[0].type) {

                case "replied_to":
                    
                    if(type_of_tweets.last_reply == 0){
                        type_of_tweets.last_reply = time
                    }else{                        
                        type_of_tweets.int_reply.push(time - type_of_tweets.last_reply)
                        type_of_tweets.last_reply = time
                    }
                    type_of_tweets.reply+=1
                    break;

                case "quoted":
                    if(type_of_tweets.last_quote == 0){
                        type_of_tweets.last_quote = time
                    }else{
                        type_of_tweets.int_quote.push(type_of_tweets.last_quote)
                        type_of_tweets.last_quote = time
                    }

                    type_of_tweets.quote+=1
                    
                    break;
                case "retweeted":
                    if(type_of_tweets.last_retweet == 0){
                        type_of_tweets.last_retweet = time
                    }else{
                        type_of_tweets.int_retweet.push(type_of_tweets.last_retweet)
                        type_of_tweets.last_retweet = time
                    }

                    type_of_tweets.retweet+=1
                    
                    break;
            }
        }else{
            if(type_of_tweets.last_original == 0){
                type_of_tweets.last_original = time
            }else{
                type_of_tweets.int_original.push(type_of_tweets.last_original)
                type_of_tweets.last_original = time
            }
            type_of_tweets.original+=1

        }

        if(type_of_tweets.last_total == 0){
            type_of_tweets.last_total = time
        }else{
            type_of_tweets.int_total.push(type_of_tweets.last_total)
            type_of_tweets.last_total = time
        }
    });

    //console.log(type_of_tweets);
}
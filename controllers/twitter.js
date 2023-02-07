const twitter = require('../twitter')
const app = twitter.v2
const fs = require('fs')

const tweet_fields = [
    'attachments', 
    'author_id', 
    'context_annotations',
    'conversation_id', 
    'created_at', 
    'entities', 'geo', 'id', 
    'in_reply_to_user_id', 
    'lang',
    'public_metrics',
    'referenced_tweets', 
    'reply_settings', 
    'source', 
    'text', 
    'withheld'
]

const tweet_media_fields = [
    'media_key','type','url',
]

function isoStringToDate (s) {
    var b = s.split(/[-t:+]/ig);
    //console.log("splited "+b);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4]));
}


const search = async (ID) => {        
        const user = await app.userByUsername(ID);
        if(user?.errors) throw new Error("Invalid user")        

        res = await app.search(`from:${ID}`,{
            'tweet.fields':tweet_fields,
            'expansions':['attachments.media_keys'],
            'media.fields':tweet_media_fields})

        res = await res.fetchLast()

        fs.writeFileSync('log.json',JSON.stringify(res),'utf8')

        let data = res._realData.data
        let media = res._realData.includes?.media
        data = data.sort((a,b) => {if(a.created_at > b.created_at) 1 ;else -1})
        let type_of_tweets = {
            text:0,
            video:0,
            photo:0,
            links:0,
            last_retweet:0,last_reply:0,last_quote:0,last_original:0,
            int_retweet:[],int_reply:[],int_quote:[],int_original:[],
            retweet:0,
            reply:0,
            quote:0,
            original:0,
            total:0,
            last_total:0,
            int_total:[]
        }

        data.forEach(e => {
            if(media && e.attachments?.media_keys){
                let found = media.find(m => m.media_key == e.attachments?.media_keys[0])
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

            let time = (isoStringToDate(e.created_at)).getTime()

            if(e?.referenced_tweets){
                //console.log(e?.referenced_tweets[0].type);
                switch (e?.referenced_tweets[0].type) {
                    case "replied_to":
                        if(type_of_tweets.last_reply == 0){
                            type_of_tweets.last_reply = time
                        }else{ 
                            type_of_tweets.int_reply.push(type_of_tweets.last_reply - time)
                            type_of_tweets.last_reply = time
                        }
                        type_of_tweets.reply+=1
                        //console.log("replied_to");
                        break;
                    case "quoted":
                        if(type_of_tweets.last_quote == 0){
                            type_of_tweets.last_quote = time
                        }else{
                            type_of_tweets.int_quote.push(type_of_tweets.last_quote - time)
                            type_of_tweets.last_quote = time
                        }

                        type_of_tweets.quote+=1
                        //console.log("quoted");
                        break;
                    case "retweeted":
                        if(type_of_tweets.last_retweet == 0){
                            type_of_tweets.last_retweet = time
                        }else{
                            type_of_tweets.int_retweet.push(type_of_tweets.last_retweet - time)
                            type_of_tweets.last_retweet = time
                        }

                        type_of_tweets.retweet+=1
                        //console.log("retweeted");
                        break;
                }
            }else{
                if(type_of_tweets.last_original == 0){
                    type_of_tweets.last_original = time
                }else{
                    type_of_tweets.int_original.push(type_of_tweets.last_original - time)
                    type_of_tweets.last_original = time
                }
                type_of_tweets.original+=1

            }

            //console.log(e.created_at);
            //console.log("time "+isoStringToDate(e.created_at))
            if(type_of_tweets.last_total == 0){
                type_of_tweets.last_total = time
            }else{
                type_of_tweets.int_total.push(type_of_tweets.last_total - time)
                type_of_tweets.last_total = time
            }
         });
        
        //console.log(res._realData.data.sort((a,b) => {if(a.created_at > b.created_at) 1 ;else -1} ))
        type_of_tweets.total = res._realData.data.length

        console.log("avg reply: "+ type_of_tweets.int_reply.reduce((acc,v) => acc+v,0)/(type_of_tweets.reply-1));
        console.log("avg quote: "+ type_of_tweets.int_quote.reduce((acc,v) => acc+v,0)/(type_of_tweets.quote-1));
        console.log("avg retweet: "+ type_of_tweets.int_retweet.reduce((acc,v) => acc+v,0)/(type_of_tweets.retweet-1));
        console.log("avg:"+ type_of_tweets.int_total.reduce((acc,v) => acc+v,0)/(type_of_tweets.total-1));
        //console.log(res._realData.data.length)
        return type_of_tweets
}

const postTwitter = async(req,res,next) => {
    console.log("Handler: "+req.body.handler)

    search(req.body.handler)
    .then(data => res.json(JSON.stringify(data)))
    .catch(err => {
        console.log(err);
        res.json(JSON.stringify(`${err.name}: ${err.message}`))
    })


}

module.exports = postTwitter
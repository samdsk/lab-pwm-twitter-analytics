const twitter = require('../twitter')
const app = twitter.v2
const fs = require('fs')
const data_process = require('./data_process')
const filename = './data.json'

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

const search = async (ID) => { 

    res = await app.search(`from:${ID}`,{
        'tweet.fields':tweet_fields,
        'expansions':['attachments.media_keys'],
        'media.fields':tweet_media_fields})

    data = await res.fetchLast()
    
    return new Promise( (resolve,reject) => fs.writeFile(filename,JSON.stringify(data), (err)=>{
        if(err) reject(err)
        console.log(">>> File created successfully !")
        resolve(data_process(filename))
    })) 
}



const postTwitter = async(req,res,next) => {
    console.log("Handler: "+req.body.handler)
    const user = await app.userByUsername(req.body.handler,{"user.fields":"public_metrics"});
    if(user?.errors) return res.json(JSON.stringify(`Error: Invalid user`))
    console.log(user.data);

    let id = user.data.id
    let followers = user.data.followers_count
    let followings = user.data.following_count
    let total_tweets = user.data.tweet_count
    // let liked_tweets = await (await app.userLikedTweets(id)).fetchLast(100)


    let mentions = await (await app.userMentionTimeline(user.data.id)).fetchLast()


    search(req.body.handler)
    .then( async (data) => {
        console.log(data);
        
        res.sendStatus(200)
    })
    .catch(err => {
        console.log(err);
        res.json(JSON.stringify(`${err.name}: ${err.message}`))
    })
}

module.exports = postTwitter
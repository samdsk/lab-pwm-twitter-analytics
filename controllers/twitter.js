const twitter = require('../twitter')
const app = twitter.v2
const fs = require('fs')
const data_process = require('./data_process')
const filename = '../data.json'

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
    const user = await app.userByUsername(ID);
        if(user?.errors) throw new Error("Invalid user")        

        res = await app.search(`from:${ID}`,{
            'tweet.fields':tweet_fields,
            'expansions':['attachments.media_keys'],
            'media.fields':tweet_media_fields})

        res = await res.fetchLast()
        
        return await fs.writeFile(filename,JSON.stringify(res), (err)=>{
            if(err) throw err
            console.log(">>> File created successfully !");
            data_process(filename)
        })

}



const postTwitter = async(req,res,next) => {
    console.log("Handler: "+req.body.handler)

    search(req.body.handler)
    .then(data => {
        console.log(data);
        res.sendStatus(200)
    })
    .catch(err => {
        console.log(err);
        res.json(JSON.stringify(`${err.name}: ${err.message}`))
    })
}

module.exports = postTwitter
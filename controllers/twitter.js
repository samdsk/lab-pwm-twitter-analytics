const twitter = require('../twitter')
const app = twitter.v2
const fs = require('fs')
const data_process = require('./data_process')
const mongoose = require('mongoose')
const SearchResults = require('../models/SearchResults')
const User = require('../models/User')

const testing_filename = './test.json'
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

const tweet_user_fields = [
    "created_at", 
    "description",
    "entities", 
    "id", 
    "location", 
    "name", 
    "pinned_tweet_id", 
    "profile_image_url",
    "protected", 
    "public_metrics", 
    "url", 
    "username", 
    "verified", 
    "verified_type", 
    "withheld"
]


const search = async (ID) => { 
    res = await app.search(`from:${ID}`,{
        'tweet.fields':tweet_fields,
        'expansions':['attachments.media_keys'],
        'media.fields':tweet_media_fields})
    
    let data = await res.fetchLast()    

    return new Promise( (resolve,reject) => fs.writeFile(filename,JSON.stringify(data), (err)=>{
        if(err) reject(err)
        console.log(">>> File created successfully !")
        
        resolve(data_process(filename))
    })) 
}

const postTwitter = async(req,res,next) => {

    console.log("New Twitter search for handler: "+req.body.handler)

    const user = await app.userByUsername(req.body.handler,{"user.fields":tweet_user_fields});
    if(user?.errors) return res.json(JSON.stringify(`Error: Invalid user`))

    console.log("request for ->",user.data);
    //let liked_tweets = await (await app.userLikedTweets(id)).fetchLast(100)

    let mentions = await (await app.userMentionTimeline(user.data.id)).fetchLast()    
    fs.writeFileSync("./output_metions.json",JSON.stringify(mentions))    
    console.log(mentions.meta.result_count);

    search(req.body.handler)
    .then( async (data,err) => {
        if(err) throw err;
        
        data._id = new mongoose.Types.ObjectId()
        data.user_id = user.data.id
        data.username = req.body.handler
        data.followers = user.data.public_metrics.followers_count
        data.followings = user.data.public_metrics.following_count
        data.total_tweets = user.data.public_metrics.tweet_count
        data.user_img = user.data.profile_image_url.replace("_normal","_bigger")
        data.name = user.data.name
        data.date = new Date()
        data.mentions = mentions.meta.result_count

        console.log("Looking for previous searches");

        const count = await User.findOne({name:req.session.username},'searched')
        .then(async searched_results => {
            let c = []
            
            for (let e of searched_results.searched){
                let found = await SearchResults.findOne({_id:e,username:req.body.handler})
                if(found) c.push(e)
            }
            return c
        })
        
        let data_2 = undefined
        
        if(count.length > 1){
            console.log("Found previous search results for same handler");
            await SearchResults.findOneAndRemove({_id:count[0]._id})
            await User.updateOne({username:req.session.username},{$pull : {searched:count[0]._id}})
            data_2 = await SearchResults.findOne({_id:count[1]._id})
        }
        
        console.log('creating search results')
        // console.log(data);
        await SearchResults.create(data)
        await User.findOneAndUpdate({name:req.session.username},{$push : {searched:data._id}}).orFail(new Error("User update failed."))

        delete(data._id)

        console.log("Writing to file");
        fs.writeFileSync("./output_data.json",JSON.stringify([data,data_2]))

        res.json(JSON.stringify([data,data_2]))
    })
    .catch(err => {
        console.log(err);
        res.json(JSON.stringify(`${err.name}: ${err.message}`))
    })
}

module.exports = postTwitter
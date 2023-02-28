const twitter = require('../twitter')
const app = twitter.v2
const fs = require('fs')
const data_process = require('./data_process')
const mongoose = require('mongoose')
const SearchResults = require('../models/SearchResults')
const User = require('../models/User')

// // ! TESTING MODE - OFF
// // ! WRITING TO DATA.JSON
// ! file is in TESTING MODE
// ! THERE ARE NO API REQUESTS SEND
// ! READING FROM data.json
const testing_filename = './data.json'
const filename = './data_asd.json'

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

// // ! testing mode
const search = async (ID) => { 
    // res = await app.search(`from:${ID}`,{
    //     'tweet.fields':tweet_fields,
    //     'expansions':['attachments.media_keys'],
    //     'media.fields':tweet_media_fields})
    
    // let data = await res.fetchLast()    
    // // ! testing mode : set data variable
    return new Promise( (resolve,reject) => fs.writeFile(filename,JSON.stringify("testing"), (err)=>{
        if(err) reject(err)
        console.log(">>> File created successfully !")
        
        resolve(data_process(testing_filename))
    })) 
}

const postTwitter = async(req,res,next) => {
    console.log("Handler: "+req.body.handler)
    const user = await app.userByUsername(req.body.handler,{"user.fields":tweet_user_fields});
    if(user?.errors) return res.json(JSON.stringify(`Error: Invalid user`))    

    // console.log("request for ->",user.data);
    // let liked_tweets = await (await app.userLikedTweets(id)).fetchLast(100)
    // let mentions = await (await app.userMentionTimeline(user.data.id)).fetchLast()
    // data_process(filename)

    search(req.body.handler)
    .then( async (data,err) => {
        if(err) throw err;
        
        data._id = new mongoose.Types.ObjectId()
        data.user_id = user.data.id
        data.username = req.body.handler
        data.followers = user.data.public_metrics.followers_count
        data.followings = user.data.public_metrics.following_count
        data.total_tweets = user.data.public_metrics.tweet_count
        data.user_img = user.data.profile_image_url
        data.date = new Date()
        //console.log(data);        

        // // ! testing mode
        // console.log('creating search results')
        // let count = await SearchResults.find({username:req.body.handler})
        

        // if(count.length > 1){
        //     await SearchResults.findOneAndRemove({_id:count[0]._id})
        //     await User.updateOne({username:req.session.username},{$pull : {searched:count[0]._id}})
        // }

        // await SearchResults.create(data)
        // await User.findOneAndUpdate({name:req.session.username},{$push : {searched:data._id}}).orFail(new Error("User update failed."))

        delete(data._id)
        res.json(JSON.stringify(data))
    })
    .catch(err => {
        console.log(err);
        res.json(JSON.stringify(`${err.name}: ${err.message}`))
    })
}

module.exports = postTwitter
const twitter = require('../twitter')
const app = twitter.v2
const fs = require('fs')
const data_process = require('../utils/data_process')
const mongoose = require('mongoose')
const SearchResults = require('../models/SearchResults')
const User = require('../models/User')
const Auth = require('../models/Auth')
const recaptcha = require('../utils/recaptcha')

const DEBUG = true
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

    let DATA = await res.fetchLast()

    if(DEBUG){
        return new Promise( (resolve,reject) => fs.writeFile(filename,JSON.stringify(DATA), (err)=>{
            if(err) reject(err)
            resolve(data_process(DATA))
        }))
    }else{
        return new Promise( (resolve,reject) => {
            resolve(data_process(DATA))
        })
    }
}

// verify the search limit of an user
const searchLimit = async (auth)=>{

    let user = await User.findById(auth._id)
    if(!user) return true

    console.log("Twitter: user has",user.searched.length,"search records");

    if(user.searched?.length > 10) return true
    return false
}

const postTwitter = async(req,res,next) => {
    // recaptcha validation
    let catpcha = await recaptcha(req.body['g-recaptcha-response'])
    if(!catpcha) return res.json({error:"Invalid captcha!"})

    //user search limit validation

    let auth = await Auth.findOne({email:req.session.email})
    if(!auth) return res.json({error:"Twitter: Invalid session"})

    let limit = await searchLimit(auth)
    console.log("Twitter: limit",limit);

    if(limit)
        return res.json({error:"Limit exceeded, please delete a search record from History page!"})

    // twitter username validation
    const user = await app.userByUsername(req.body.handler,{"user.fields":tweet_user_fields});
    if(user?.errors) return res.json({error:`Invalid user`})

    if(DEBUG)
        console.log("Twitter: request for ->",user.data)

    //API call for recent mentions
    let mentions = await (await app.userMentionTimeline(user.data.id)).fetchLast()

    if(DEBUG)
        fs.writeFileSync("./output_metions.json",JSON.stringify(mentions))

    search(req.body.handler)
    .then( async (data,err) => {
        if(err) return res.json({error:"Twitter search: "+err.message})

        // populating data object
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

        // Limit display
        console.log("Twitter Limit:",data.limit.limit,data.limit.remaining,data.limit.reset)

        console.log('Twitter: creating search results')
        await SearchResults.create(data)
        await User.findOneAndUpdate({_id:auth._id},{$push : {searched:data._id}})

        delete(data._id)

        if(DEBUG){
            console.log("Twitter: Writing to file");
            fs.writeFileSync("./output_data.json",JSON.stringify([data,null]))
        }

        console.log("Twitter: sending data");
        return res.json(data)
    })
    .catch(err => {
        console.log(err);
        return res.json({error:err.message})
    })
}

module.exports = postTwitter
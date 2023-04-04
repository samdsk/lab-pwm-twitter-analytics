const twitter = require('../twitter')
const app = twitter.v2
const fs = require('fs')
const data_process = require('../utils/data_process')
const mongoose = require('mongoose')
const SearchResults = require('../models/SearchResults')
const User = require('../models/User')
const Auth = require('../models/Auth')
const recaptcha = require('../utils/recaptcha')

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
        resolve(data_process(filename))
    }))
}

const postTwitter = async(req,res,next) => {
    let catpcha = await recaptcha(req.body['g-recaptcha-response'])
    if(!catpcha) return res.json(JSON.stringify({error:"Invalid captcha!"}))

    const user = await app.userByUsername(req.body.handler,{"user.fields":tweet_user_fields});
    if(user?.errors) return res.json(JSON.stringify({error:`Invalid user`}))

    console.log("Twitter: request for ->",user.data);
    //let liked_tweets = await (await app.userLikedTweets(id)).fetchLast(100)

    let mentions = await (await app.userMentionTimeline(user.data.id)).fetchLast()

    fs.writeFileSync("./output_metions.json",JSON.stringify(mentions))

    search(req.body.handler)
    .then( async (data,err) => {
        if(err) return res.json(JSN.stringify({error:"Twitter search: "+err.message}))

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

        console.log('Twitter: creating search results')

        Auth.findOne({email:req.session.email}).exec(async (err,auth)=>{
            if(err) return res.json(JSON.stringify({error:"Twitter: email not found"}))

            await SearchResults.create(data)
            await User.findOneAndUpdate({_id:auth._id},{$push : {searched:data._id}})

            delete(data._id)
            console.log("Twitter: Writing to file");
            fs.writeFileSync("./output_data.json",JSON.stringify([data,null]))

            console.log("Twitter: sending data");
            return res.json(JSON.stringify([data,null]))
        })
    })
    .catch(err => {
        console.log(err);
        res.json(JSON.stringify({error:err.message}))
    })
}

module.exports = postTwitter
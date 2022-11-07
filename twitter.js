const {TwitterApi} = require('twitter-api-v2')
const fs = require('fs')
require('dotenv').config()

const app = new TwitterApi({
    appKey : process.env.Api_Key,
    appSecret : process.env.Api_Secret_Key,
    accessToken : process.env.Access_Token,
    accessSecret : process.env.Access_Token_Secret
})

const twitter = new TwitterApi(process.env.Bearer_Token)

module.exports = twitter


const {TwitterApi} = require('twitter-api-v2')
require('dotenv').config()

const twitter = new TwitterApi(process.env.Bearer_Token)
module.exports = twitter.readOnly

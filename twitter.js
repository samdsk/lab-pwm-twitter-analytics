const {TwitterApi} = require('twitter-api-v2')
const fs = require('fs')
require('dotenv').config()

const app = new TwitterApi(process.env.Bearer_Token)
const client = app.appLogin()
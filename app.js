const { query } = require('express')
const twitter = require('./twitter.js')
const app = twitter.v2

const tweet_fields = ['attachments', 
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

const tweet = async () => {
    try {        
        
        res = await app.search("from:leo_shane",{'tweet.fields':tweet_fields})        
        res = await res.fetchLast()
        
        //console.log(res._realData.data.sort((a,b) => {if(a.created_at > b.created_at) 1 ;else -1} ))

        console.log(res._realData.data.length)

    } catch (error) {
        console.error(error)
    }
}

tweet()
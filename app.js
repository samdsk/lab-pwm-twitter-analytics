const twitter = require('./twitter.js')

const tweet = async () => {
    try {
        const tws = await twitter.v2.currentUserV2
        console.log(tws)
    } catch (error) {
        console.error(error)
    }
}

tweet()
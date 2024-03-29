const Auth = require('../models/Auth')
const User = require('../models/User')
const SearchResults = require('../models/SearchResults')

// return search records of given email
const getSearchedResults = async (email) => {
    let user = await Auth.findOne({email:email})
    let searched = await User.findOne({_id:user._id},'searched')
    searched = searched.searched
    const results = []
    const projections = `_id date name user_img username
    start_date end_date followings followers total_tweets total.count`;

    await Promise.all(
        searched.map( async (id) => {
            let temp = await SearchResults.findById(id,projections)
            results.push(temp)
        })
    )

    return results
}

// render history page
const getHistory = async (req,res,next) => {

    let results = await getSearchedResults(req.session.email)

    results = results.sort( (a,b)=>{
        return new Date(a.date) < new Date(b.date) ? 1 : -1
    })

    res.render('pages/history',{
        logout:true,
        username:req.session.username,
        email_hash:req.session.gravatar,
        results:results,
        history:true,
        dashboard:true,
    })
}

module.exports = getHistory
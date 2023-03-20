const mongoose = require('mongoose')
const Auth = require('../models/Auth')
const User = require('../models/User')
const SearchResults = require('../models/SearchResults')

const getSearchedResults = async (email) => {
    let user = await Auth.findOne({email:email})
    let searched = await User.findOne({_id:user._id},'searched')
    searched = searched.searched
    const results = []
    await Promise.all(
        searched.map( async (result)=> {
            let temp_result = await SearchResults.findById(result)
            results.push(temp_result)
        })
    )

    console.log(results.length, searched.length)
}

const getHistory = async (req,res,next) => {
    getSearchedResults(req.session.email)
    res.render('pages/history',{logout:true,username:req.session.username})
}

module.exports = getHistory
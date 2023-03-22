const mongoose = require('mongoose')
const Auth = require('../models/Auth')
const User = require('../models/User')
const SearchResults = require('../models/SearchResults')
const path = require('path')


const getResults = async (req,res,next) => {

    if(req.query.compare > 0){
        console.log("Compare mode:",(req.query.id));
        return res.sendStatus(400)
    }else{
        console.log("Single mode:",typeof(req.query.id));

        if(!mongoose.isValidObjectId(req.query.id)) return res.sendStatus(400)

        let user_id = await Auth.findOne({email:req.session.email})
        let searched = await User.findById(user_id._id,'searched')

        if(!searched.searched.includes(req.query.id)){
            return res.sendStatus(400)
        }

        let result = await SearchResults.findById(req.query.id)


        res.json(JSON.stringify([result]))
    }


    //res.sendFile(path.resolve(path.join(__dirname,'../views/partials/results.ejs')))
}

module.exports = {getResults}
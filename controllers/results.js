const mongoose = require('mongoose')
const Auth = require('../models/Auth')
const User = require('../models/User')
const SearchResults = require('../models/SearchResults')
const path = require('path')


const getResults = async (req,res,next) => {

    async function validateID(id){
        if(!mongoose.isValidObjectId(id)) return false

        let user_id = await Auth.findOne({email:req.session.email})
        let searched = await User.findById(user_id._id,'searched')

        if(!searched.searched.includes(id)){
            return false
        }

        return true
    }

    if(req.query.compare > 0){

        if(!req.query.id.length) return res.sendStatus(400)
        if(req.query.id.length != 2) return res.sendStatus(400)
        if(!(validateID(req.query.id[0]) && validateID(req.query.id[1])))
            return res.sendStatus(400)

        let result_1 = await SearchResults.findById(req.query.id[0])
        let result_2 = await SearchResults.findById(req.query.id[1])

        res.json(JSON.stringify([result_1,result_2]))

    }else{
        if(!(validateID(req.query.id)))
            return res.sendStatus(400)

        let result = await SearchResults.findById(req.query.id)

        res.json(JSON.stringify([result]))
    }

}

module.exports = {getResults}
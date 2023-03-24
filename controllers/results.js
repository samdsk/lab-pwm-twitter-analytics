const mongoose = require('mongoose')
const Auth = require('../models/Auth')
const User = require('../models/User')
const SearchResults = require('../models/SearchResults')

async function validateID(id,email){

    if(!mongoose.isValidObjectId(id)) return false

    let user_id = await Auth.findOne({email:email})
    let searched = await User.findById(user_id._id,'searched')

    if(!searched.searched.includes(id)){
        return false
    }

    return true
}


const getResults = async (req,res,next) => {
    let email = req.session.email
    if(req.query.compare > 0){

        if(!req.query.id.length) return res.sendStatus(400)
        if(req.query.id.length != 2) return res.sendStatus(400)

        if(!(await validateID(req.query.id[0],email)
            && await validateID(req.query.id[1],email)))
            return res.sendStatus(400)

        let result_1 = await SearchResults.findById(req.query.id[0])
        let result_2 = await SearchResults.findById(req.query.id[1])

        res.json(JSON.stringify([result_1,result_2]))

    }else{
        if(!(await validateID(req.query.id,email)))
            return res.sendStatus(400)

        let result = await SearchResults.findById(req.query.id)

        res.json(JSON.stringify([result]))
    }

}

// NOTE remove disabled
const removeResult = async (req,res,next) => {

    if(!req.body.id) return res.sendStatus(400)
    if(! await validateID(req.body.id,req.session.email)) return res.sendStatus(400)

    // SearchResults.findByIdRemove(req.body.id).exec(function(err,item){
    //     if(err) return res.sendStatus(400)
    //     if(!item) return res.sendStatus(404)

    // })

    return res.sendStatus(200)
}

module.exports = {getResults,removeResult}
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
        console.log("Results: new single request received.");

        if(!req.query.id.length) return res.json(JSON.stringify({error:"Must provide two ids"}))
        if(req.query.id.length != 2) return res.json(JSON.stringify({error:"Must provide two ids"}))

        if(!(await validateID(req.query.id[0],email)
            && await validateID(req.query.id[1],email)))
            return res.json(JSON.stringify({error:"Invalid ids"}))

        let result_1 = await SearchResults.findById(req.query.id[0])
        let result_2 = await SearchResults.findById(req.query.id[1])

        return res.json(JSON.stringify([result_1,result_2]))

    }else{
        console.log("Results: new compare request received.");

        if(!(await validateID(req.query.id,email)))
            return res.json(JSON.stringify({error:"Invalid id"}))

        let result = await SearchResults.findById(req.query.id)

        return res.json(JSON.stringify([result]))
    }
}


const removeResult = async (req,res,next) => {
    console.log("Results: delete request received.");
    if(!req.body.id) return res.json(JSON.stringify({error:"Missing id"}))
    if(! await validateID(req.body.id,req.session.email)) return res.json(JSON.stringify({error:"Invalid id"}))

    SearchResults.findByIdAndRemove(req.body.id).exec(function(err,item){
        if(err) return res.json(JSON.stringify({error:"Search record not found"}))

        Auth.findOne({email:req.session.email},async (err,auth)=>{
            if(err) return res.json(JSON.stringify({error:"Invalid request"}))
            User.updateOne({_id:auth._id},{$pull : {searched:req.body.id}},(err,user)=>{
                if(err) return res.json(JSON.stringify({error:"User search record not found"}))
            })

        })

    })

    return res.sendStatus(200)
}

module.exports = {getResults,removeResult}
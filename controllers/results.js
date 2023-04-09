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
    console.log(typeof(req.query.id));

    if(typeof(req.query.id) === 'string'){
        console.log("Results: new single request received.");

        if(!(await validateID(req.query.id,email)))
            return res.json({error:"Invalid id"})

        let result = await SearchResults.findById(req.query.id)

        return res.json(result)
    }else{
        console.log("Results: new compare request received.");

        if(!req.query.id.length) return res.json({error:"Must provide two ids"})
        if(req.query.id.length != 2) return res.json({error:"Must provide two ids"})

        if(!(await validateID(req.query.id[0],email)
            && await validateID(req.query.id[1],email)))
            return res.json({error:"Invalid ids"})

        let result_1 = await SearchResults.findById(req.query.id[0])
        let result_2 = await SearchResults.findById(req.query.id[1])

        return res.json([result_1,result_2])

    }
}


const removeResult = async (req,res,next) => {
    console.log("Results: delete request received.");
    if(!req.body.id) return res.json({error:"Missing id"})
    if(! await validateID(req.body.id,req.session.email)) return res.json({error:"Invalid id"})

    SearchResults.findByIdAndRemove(req.body.id).exec(function(err,item){

        if(!item)res.json({error:"Search record not found"})

        Auth.findOne({email:req.session.email},async (err,auth)=>{

            if(!auth) return res.json({error:"Invalid request"})
            User.updateOne({_id:auth._id},{$pull : {searched:req.body.id}},(err,user)=>{
                if(err) return res.json({error:"User search record not found"})
            })

        })

    })

    return res.sendStatus(200)
}

module.exports = {getResults,removeResult}
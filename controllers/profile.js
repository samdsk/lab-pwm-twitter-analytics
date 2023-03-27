const bcrypt = require('bcrypt')
const Auth = require("../models/Auth")
const SearchResults = require('../models/SearchResults')
const getProfile = async (req,res,next) => {

    res.render('pages/profile',{
        logout:true,
        username:req.session.username,
        email: req.session.email,
        email_hash:req.session.gravatar
    })
}

const postProfile = async (req,res,next) => {
    if(req.session.email){
        if(req.body.change_psw){
            const password = await bcrypt.hash(req.body.signup_password,10)
            Auth.findOneAndUpdate({email:req.session.email},{password:password}).exec((err,data)=>{
                if(err) {
                    res.sendStatus(500)
                    throw new Error("Profile change: Auth error")
                }
            })
            res.sendStatus(200)
        }
    }
}
const deleteProfile = async (req,res,next) => {
    if(req.session.email){

        let id = await Auth.findOne({email:req.session.email},'_id')
        let searched = await User.findById(_id,'searched')
        await Promise.all(
            searched.searched.map(async(x)=>{
                SearchResults.findByIdAndRemove(x).exec((err,data)=>{
                    if(err) {
                        res.sendStatus(500)
                        throw new Error("Profile delete: SearchResults error")
                    }
                })
            })
        )

        Auth.findByIdAndRemove(id._id).exec((err,data)=>{
            if(err) {
                res.sendStatus(500)
                throw new Error("Profile delete: Auth error")
            }
        })

        User.findByIdAndRemove(id._id).exec((err,data)=>{
            if(err) {
                res.sendStatus(500)
                throw new Error("Profile delete: User error")
            }
        })

        res.sendStatus(200)

    }
}



module.exports = {getProfile,postProfile,deleteProfile}
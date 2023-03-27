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

// NOTE psw update disabled
const postProfile = async (req,res,next) => {
    if(req.session.email){
        const {password,change_password,change_password_2} = req.body
        if(change_password != change_password_2)
            throw new Error("Passwords don't match")

        Auth.findOne({email:req.session.email},async function(err,auth){
            bcrypt.compare(password,auth.password).then(async (check)=>{

                if(!check) throw new Error("Credentials are not valid")
                const password = await bcrypt.hash(change_password,10)
                //await Auth.findByIdAndUpdate(auth._id,{password:password})

                return res.sendStatus(200)
            })

        })
    }else{
        return res.sendStatus(500)
    }


}

const deleteProfile = async (req,res,next) => {
    if(req.session.email){

        console.log(req.body);

        // let id = await Auth.findOne({email:req.session.email},'_id')
        // let searched = await User.findById(_id,'searched')

        // await Promise.all(
        //     searched.searched.map(async(x)=>{
        //         SearchResults.findByIdAndRemove(x).exec((err,data)=>{
        //             if(err) {

        //                 throw new Error("Profile delete: SearchResults error")
        //             }
        //         })
        //     })
        // )

        // Auth.findByIdAndRemove(id._id).exec((err,data)=>{
        //     if(err) {
        //         throw new Error("Profile delete: Auth error")
        //     }
        // })

        // User.findByIdAndRemove(id._id).exec((err,data)=>{
        //     if(err) {
        //         throw new Error("Profile delete: User error")
        //     }
        // })

        res.sendStatus(200)

    }
}



module.exports = {getProfile,postProfile,deleteProfile}
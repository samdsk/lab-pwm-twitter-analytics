const bcrypt = require('bcrypt')
const Auth = require("../models/Auth")
const User = require("../models/User")
const SearchResults = require('../models/SearchResults')
const recaptcha = require('../utils/recaptcha')

const getProfile = async (req,res,next) => {
    res.render('pages/profile',{
        logout:true,
        username:req.session.username,
        email: req.session.email,
        email_hash:req.session.gravatar,
        profile:true,
        dashboard:true,
    })
}

const updateProfile = async (req,res,next) => {
    console.log("Profile: update psw request received.");

    if(req.session.email){

        let catpcha = await recaptcha(req.body['g-recaptcha-response'])
        if(!catpcha) return res.json({error:"Invalid captcha!"})

        const {password,new_password,new_password_confirm} = req.body
        if(new_password !== new_password_confirm)
            return res.json({error:"Passwords don't match"})

        Auth.findOne({email:req.session.email},async function(err,auth){
            bcrypt.compare(password,auth.password).then(async (check)=>{

                if(!check) return res.json({error:"Credentials are not valid"})
                const password = await bcrypt.hash(new_password,10)
                await Auth.findByIdAndUpdate(auth._id,{password:password})

                return res.json({success:"Password updated"})
            })

        })
    }else{
        return res.sendStatus(500)
    }


}

const deleteProfile = async (req,res,next) => {
    console.log("Profile: profile delete request received!");

    if(req.session.email){
        Auth.findOne({email:req.session.email},async function(err,auth){
            console.log(req.body.password);
            await bcrypt.compare(req.body.password,auth.password).then(async (check)=>{

                if(!check) return res.json({error:"Credentials are not valid"})
                console.log("pass: psw");

                let searched = await User.findById(auth._id,'searched')

                await Promise.all(
                    searched.searched.map(async(x)=>{
                        SearchResults.findByIdAndRemove(x).exec((err,data)=>{
                            if(err) {
                                return res.json({error:"Profile delete: SearchResults error"})
                            }
                            console.log("pass: search",x);
                        })
                    })
                )

                Auth.findByIdAndRemove(auth._id).exec((err,data)=>{
                    if(err) {
                        return res.json({error:"Profile delete: Auth error"})
                    }
                    console.log("pass: delete auth");
                })

                User.findByIdAndRemove(auth._id).exec((err,data)=>{
                    if(err) {
                        return res.json({error:"Profile delete: User error"})
                    }
                    console.log("pass: delete user");
                })

                req.session.destroy()
                return res.json({success:"Profile has been delete successfully"})
            })

        })
    }else{
        return res.sendStatus(500)
    }
}



module.exports = {getProfile,updateProfile,deleteProfile}
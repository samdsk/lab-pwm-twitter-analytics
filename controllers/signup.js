const Auth = require('../models/Auth')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const recaptcha = require('../utils/recaptcha')

const createUser = async (req,res,next) => {
    if( !req.body.email ||
        !req.body.password ||
        !req.body.name ||
        !req.body.terms) return res.json(JSON.stringify({error:"Missing fields"}))

    if((req.body.password != req.body.password_confirm)) return res.json(JSON.stringify({error:"Passwords don't match!"}))

    let catpcha = await recaptcha(req.body['g-recaptcha-response'])
    if(!catpcha) return res.json(JSON.stringify({error:"Invalid captcha!"}))


    Auth.findOne({email:req.body.email}, async (err,auth)=>{

        if(auth != null) return res.json(JSON.stringify({error:"User already exists!"}))

        const password = await bcrypt.hash(req.body.password,10)
        const id = new mongoose.Types.ObjectId()

        Auth.create({_id:id,email:req.body.email,password : password},(err,data)=>{
            if(err) {
                return res.json(JSON.stringify({error:"Internal Auth error"}))
            }

            User.create({_id:id,name:req.body.name},(err,data)=>{
                if(err) {
                    return res.json(JSON.stringify({error:"Interval User error"}))
                }
            })
        })

        if(req.session)
            req.session.destroy()

        return res.json(JSON.stringify({success:"User created successfully!"}))
    })
}

const signupPage = async (req,res) => {
    if(!req.session.username || !req.session.email)
        res.render('pages/singup',{signup:true})
    else
        res.render('pages/singup',{signup:true,logout:true})
}



module.exports = {createUser, signupPage}
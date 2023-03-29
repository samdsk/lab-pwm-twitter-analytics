const Auth = require('../models/Auth')
const User = require('../models/User')
const required_params = require('../utils/required_params')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const {createError} = require('../errors/customError')

const createUser = async (req,res,next) => {

    if( !req.body.signup_email ||
        !req.body.signup_password ||
        !req.body.signup_name ||
        !req.body.signup_terms) return res.json(JSON.stringify({error:"Missing fields"}))

    Auth.findOne({email:req.body.signup_email}, async (err,auth)=>{

        if(auth != null) return res.json(JSON.stringify({error:"User already exists!"}))

        const password = await bcrypt.hash(req.body.signup_password,10)
        const id = new mongoose.Types.ObjectId()

        Auth.create({_id:id,email:req.body.signup_email,password : password},(err,data)=>{
            if(err) {
                return res.json(JSON.stringify({error:"Internal Auth error"}))
            }

            User.create({_id:id,name:req.body.signup_name},(err,data)=>{
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
    res.render('pages/singup')
}



module.exports = {createUser, signupPage}
const Auth = require('../models/Auth')
const User = require('../models/User')
const required_params = require('../utils/required_params')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const {createError} = require('../errors/customError')

const createUser = async (req,res,next) => {
    const params_check = required_params(["signup_email","signup_password","signup_name","signup_terms"],req)
    
    if(!params_check) return res.redirect("signup/?error=Missing fields")    

    Auth.findOne({email:req.body.signup_email}, async (err,auth)=>{
        
        if(auth != null) return res.redirect("signup/?error=User already exists!")

        const password = await bcrypt.hash(req.body.signup_password,10)
        const id = new mongoose.Types.ObjectId()    

        Auth.create({_id:id,email:req.body.signup_email,password : password})
        User.create({_id:id,name:req.body.signup_name})

        res.status(200).send('Ok')
    })
    
    res.json(req.body)
}

const signupPage = async (req,res) => {
    res.render('pages/singup')
}



module.exports = {createUser, signupPage}
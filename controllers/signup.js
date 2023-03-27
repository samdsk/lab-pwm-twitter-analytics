const Auth = require('../models/Auth')
const User = require('../models/User')
const required_params = require('../utils/required_params')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const {createError} = require('../errors/customError')

const createUser = async (req,res,next) => {

    if(!(res.body.signup_email &&
        res.body.signup_password &&
        res.body.signup_name &&
        res.body.signup_terms)) return res.redirect("signup/?error=Missing fields")

    Auth.findOne({email:req.body.signup_email}, async (err,auth)=>{

        if(auth != null) return res.redirect("signup/?error=User already exists!")

        const password = await bcrypt.hash(req.body.signup_password,10)
        const id = new mongoose.Types.ObjectId()

        Auth.create({_id:id,email:req.body.signup_email,password : password}).exec((err,data)=>{
            if(err) {
                res.sendStatus(500)
                throw new Error("Singup: Auth error")
            }
        })
        User.create({_id:id,name:req.body.signup_name}).exec((eerr,data)=>{
            if(err) {
                res.sendStatus(500)
                throw new Error("Singup: User error")
            }

        })

        res.status(200).send('Ok')
    })

    res.json(req.body)
}

const signupPage = async (req,res) => {
    res.render('pages/singup')
}



module.exports = {createUser, signupPage}
const Auth = require('../models/Auth')
const User = require('../models/User')
const required_params = require('../middleware/required_params')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

const createUser = async (req,res) => {
    //const params_check = required_params(["signup_email","signup_password","signup_name","signup_password_2","signup_terms"],req)
    
    //if(!params_check) return res.status(400).send("Missing fields")
    //console.log(await Auth.findOne({email:req.body.signup_email}))


    
    Auth.findOne({email:req.body.signup_email},(err,auth)=>{
        console.log(user)
    })
    console.log(user)
    // if(user != null) return res.status(400).send("User already exists!")
    // if(req.body.signup_password_2 != req.body.signup_password) return res.status(400).send("Passwords don't match")

    // const password = await bcrypt.hash(req.body.signup_password,10)
    // const id = new mongoose.Types.ObjectId()    

    // Auth.create({_id:id,email:req.body.signup_email,password : password})
    // User.create({_id:id,name:req.body.signup_name})

    res.status(200).send('Ok')

}

const signupPage = async (req,res) => {
    res.render('pages/singup')
}



module.exports = {createUser, signupPage}
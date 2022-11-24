const Auth = require('../models/Auth')
const Person = require('../models/Person')
const required_params = require('../middleware/required_params')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

const signup = async (req,res) => {
    const params_check = required_params(["signup_email","signup_password","signup_name","signup_password_2","signup_terms"],req)
    
    if(!params_check) return res.status(400).send("Missing fields")
    //console.log(await Auth.findOne({email:req.body.signup_email}))
    
    const password = Auth.findOne({email:req.body.signup_email},(err, data)=>{
        if(err) return console.log("Error: "+err)
        if(data != null) return res.status(400).send("User already exists!")

        if(req.body.signup_password_2 != req.body.signup_password) return res.status(400).send("Passwords don't match")

        bcrypt.hash(req.body.signup_password,10, (err,encrypted) => {
            if(err) return res.status(400).send("Error occurred during encryption")
            return encrypted
        })

        return null
    })
    
    const id = new mongoose.mongo.ObjectId()


    Auth.create({_id:id,email:req.body.signup_email,password : password})
    Person.create({_id:id,name:req.body.signup_name})


    

    

    console.log(Auth.find({email:req.body.signup_email}))
    
    

    //console.log(req.body)
    res.send('Ok')
}

const signup_page = async (req,res) => {
    res.render('pages/singup')
}



module.exports = {signup, signup_page}
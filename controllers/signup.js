const Auth = require('../models/Auth')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const recaptcha = require('../utils/recaptcha')
const sendEmail = require('../utils/sendEmail')

const createUser = async (req,res,next) => {
    console.log("Signup: request recieved");

    if( !req.body.email ||
        !req.body.password ||
        !req.body.password_confirm ||
        !req.body.name ||
        !req.body.terms) return res.json({error:"Missing fields"})

    if((req.body.password != req.body.password_confirm)) return res.json({error:"Passwords don't match!"})

    let catpcha = await recaptcha(req.body['g-recaptcha-response'])
    if(!catpcha) return res.json({error:"Invalid captcha!"})


    Auth.findOne({email:req.body.email}, async (err,auth)=>{

        if(auth != null) return res.json({error:"User already exists!"})

        const password = await bcrypt.hash(req.body.password,10)
        const id = new mongoose.Types.ObjectId()

        Auth.create({_id:id,email:req.body.email,password : password},(err,data)=>{
            if(err) {
                return res.json({error:"Internal Auth error"})
            }

            User.create({_id:id,name:req.body.name},(err,data)=>{
                if(err) {
                    return res.json({error:"Interval User error"})
                }
            })
        })

        if(req.session)
            req.session.destroy()

        const mail_opt = {
            from:"My Twitter Analytics",
            to:req.body.email,
            subject:"Welcome to My Twitter Analytics App",
            text:`Welcome ${req.body.name} to My Twitter Analytics App, you've successfully created an account!`,
            html:`
                <h4 class="h4">Welcome ${req.body.name}</h4>
                <p>You've successfully created an account!</p>
                <p>Email ${req.body.email}</p>
                <p>Password ${req.body.password}</p>
                `
        }

        await sendEmail(mail_opt).then(()=>{
            console.log("Signup: email sent.");
        }).catch((err)=>{
            console.log("Signup: email error - ",err);
        })

        return res.json({success:"User created successfully!"})
    })
}

const signupPage = async (req,res) => {
    if(!req.session.username || !req.session.email)
        res.render('pages/singup',{signup:true})
    else
        res.render('pages/singup',{signup:true,logout:true})
}



module.exports = {createUser, signupPage}
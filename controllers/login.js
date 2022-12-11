const Auth = require('../models/Auth')
const bcrypt = require('bcrypt')
const {createError} = require('../errors/customError')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const SessionDuration = 200000

const login = async (req,res,next) => {
    const {login_email, login_password, login_remember } = req.body
    
    Auth.findOne({email:login_email}, async (err,auth)=> {        
        if(auth === null) return res.redirect("/?error=Credentials are not valid")

        await bcrypt.compare(login_password,auth.password).then(async (check)=>{
            
            if(!check) return res.redirect("/?error=Credentials are not valid")

            const token = jwt.sign({email:login_email},process.env.Server_Secret,{expiresIn:"20s"}) 

            const username = await User.findOne({_id:auth._id})
            res.cookie('logout','true',{maxAge : SessionDuration})
            req.session.username = username.name
        // ! session maxage
            if(login_remember === "on") req.session.cookie.maxAge = SessionDuration

            // ?token='+token
            res.redirect('/dashboard')
            
        }).catch((err)=>{console.log(err)})
    })

}

module.exports = login
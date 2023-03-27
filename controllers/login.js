const Auth = require('../models/Auth')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const SessionDuration = 1000 * 60 * 60 * 60
const md5 = require('md5')

const login = async (req,res,next) => {
    const {login_email, login_password, login_remember } = req.body

    Auth.findOne({email:login_email}, async (err,auth)=> {
        if(auth === null) throw new Error("Credentials are not valid")

        await bcrypt.compare(login_password,auth.password).then(async (check)=>{

            if(!check) throw new Error("Credentials are not valid")

            //const token = jwt.sign({email:login_email},process.env.Server_Secret,{expiresIn:"20s"})

            const username = await User.findOne({_id:auth._id}).populate('_id')
            const email_hash = md5(login_email.trim().toLowerCase())

            req.session.username = username.name
            req.session.email = username._id.email
            req.session.gravatar = email_hash

            // ! session maxage
            if(login_remember === "on") req.session.cookie.maxAge = SessionDuration

            res.redirect('/dashboard/profile')

        }).catch((err)=>{console.log(err)})
    })

}

module.exports = login
const Auth = require('../models/Auth')
const User = require('../models/User')

const bcrypt = require('bcrypt')
const md5 = require('md5')

// Remember me session duration
const SessionDuration = 1000 * 60 * 60 * 48 // ms s m h 48hours

// login process
const login = async (req,res,next) => {
    const {email, password, remember} = req.body
    console.log("Login: new request received for:",email);

    Auth.findOne({email:email}, async (err,auth)=> {
        if(auth == null) return res.redirect("/?error=Invalid credentials")

        await bcrypt.compare(password,auth.password).then(async (check)=>{
            if(!check) return res.redirect("/?error=Invalid credentials")

            const username = await User.findOne({_id:auth._id}).populate('_id')
            const email_hash = md5(email.trim().toLowerCase())

            req.session.username = username.name
            req.session.email = username._id.email
            req.session.gravatar = email_hash

            // ! session maxage
            if(remember === "on") req.session.cookie.maxAge = SessionDuration

            req.session.save()
            return res.redirect('/dashboard/history')

        }).catch((err)=>{
            res.sendStatus(500)
        })
    })

}

module.exports = login
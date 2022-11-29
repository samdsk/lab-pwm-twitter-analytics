const Auth = require('../models/Auth')
const bcrypt = require('bcrypt')
const {createError} = require('../errors/customError')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const login = async (req,res,next) => {
    const {login_email, login_password} = req.body

    Auth.findOne({email:login_email}, async (err,auth)=> {        
        if(auth === null) return next(createError(401,"Credentials are not valid"))

        await bcrypt.compare(login_password,auth.password).then(async (check)=>{
            
            if(!check) return next(createError(401,"Credentials are not valid"))

            const token = jwt.sign({email:login_email},process.env.Server_Secret,{expiresIn:"20s"}) 

            const username = await User.findOne({_id:auth._id})
            console.log(req.session)
            req.session.username = username.name
            res.redirect('/dashboard?token='+token)
            
        }).catch((err)=>{console.log(err)})
    })

}

module.exports = login
const Auth = require('../models/Auth')
//const Person = require('../models/User')
const bcrypt = require('bcrypt')
const {createError} = require('../errors/customError')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
//const cookie_parser = require('cookie-parser')

const login = async (req,res,next) => {
    //required_params(["login_email","login_password"],req)
    const {login_email, login_password} = req.body

    Auth.findOne({email:login_email}, async (err,auth)=> {
        console.log(auth)
        if(auth === null) return next(createError(401,"Credentials are not valid"))

        await bcrypt.compare(login_password,auth.password).then(async (check)=>{
            console.log(check)
            if(!check) return next(createError(401,"Credentials are not valid"))
            const token = jwt.sign({email:login_email},process.env.Server_Secret,{expiresIn:"5s"})           
            const username = await User.findOne({_id:auth._id})

            console.log(username)
            res.status(200).json({'token':token,'user':username.name})
            
        }).catch((err)=>{console.log(err)})
    })

}

module.exports = login
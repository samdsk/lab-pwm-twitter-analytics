const Auth = require('../models/Auth')
//const Person = require('../models/User')
const bcrypt = require('bcrypt')
const {createError} = require('../errors/customError')
const jwt = require('jsonwebtoken')
//const cookie_parser = require('cookie-parser')

const login = async (req,res,next) => {
    //required_params(["login_email","login_password"],req)
    const {login_email, login_password} = req.body

    Auth.findOne({email:login_email}, async (err,auth)=> {

        if(auth === null) return next(createError(401,"Credentials are not valid"))
        await bcrypt.compare(login_password,auth.password).then((check)=>{
            const token = jwt.sign(login_email,process.env.Server_Secret)
            res.cookie('accesstoken',token,{maxAge:900000,secure:true})

            console.log(token)
            res.sendStatus(200)
            
        }).catch((err)=>{console.log(err)})
    })

}

module.exports = login
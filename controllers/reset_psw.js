const Auth = require('../models/Auth')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const recaptcha = require('../utils/recaptcha')
const sendEmail = require('../utils/sendEmail')
const JWT_EXP = '30m'

const getReset = async (req,res,next) => {
    const {email,token} = req.params

    if(!email || !token){
        return res.sendStatus(500)
    }else{
        Auth.findOne({email:email},(err,auth)=>{
            if(err) return res.json({error:"Invalid email"})
            if(!auth) return res.sendStatus(404)

            const secret = process.env.Server_Secret + auth.password
            try {
                const data = jwt.verify(token,secret)
                return res.render('./pages/reset_psw',{email:data.email})
            } catch (error) {
                return res.sendStatus(404)
            }
        })
    }

}


const putReset = async (req,res,next) =>{
    console.log("reset request recieved");
    const {email,password,password_confirm} = req.body

    let catpcha = await recaptcha(req.body['g-recaptcha-response'])
    if(!catpcha) return res.json({error:"Invalid captcha!"})


    if(!email || !password || !password_confirm) return res.json({error:"Invalid request"})
    if(password !== password_confirm) return res.json({error:"Passwords don't match"})

    Auth.findOne({email:email},async (err,auth)=>{
        if(err) return res.json({error:"Invalid email"})
        if(!auth) return res.json({error:"Invalid email"})

        const password_new = await bcrypt.hash(password,10)
        Auth.findByIdAndUpdate(auth._id,{password:password_new}).exec(function(err,auth){
            if(err) return res.sendStatus(500)
        })

        const secret = process.env.Server_Secret + password_new

        const token = jwt.sign({
            email:auth.email
        },secret,{expiresIn:JWT_EXP})

        const link = `http://${process.env.HOSTNAME}/reset-password/${auth.email}/${token}`

        const mail_opt = {
            from:"My Twitter Analytics",
            to:email,
            subject:"Password Reset | My Twitter Analytics",
            text:`You have resetted your account's password recently ${email}`,
            html:`
                <h4 class="h4">Password Reset - My Twitter Analytics</h4>
                <p>You have resetted your account's password recently ${email}</p>
                <p>Password: ${password}</p>
                <p>If you haven't request a password reset please change your password!</p>
                <a href="${link}">${link}</a>
                `
        }

        await sendEmail(mail_opt).then(()=>{
            console.log("Reset Psw: email sent.");
        }).catch((err)=>{
            console.log("Reset Psw: email error - ",err);
        })

        return res.json({success:"Password was changed successfully!"})
    })
}





module.exports = {getReset,putReset}
const Auth = require('../models/Auth')
const jwt = require('jsonwebtoken')
const sendEmail = require('../utils/sendEmail')
const User = require('../models/User')

const JWT_EXP = '30m'

// FIXME change the email address

const postEmail = async (req,res,next) => {
    console.log("psw forgot request recieved");

    if(req.body.email){
        Auth.findOne({email:req.body.email},async (err,auth)=>{

            if(err) return res.sendStatus(500)
            if(!auth) return res.json(JSON.stringify({error:"Invalid email"}))

            const name = await User.findById(auth._id)

            const secret = process.env.Server_Secret + auth.password
            const token = jwt.sign({
                email:auth.email
            },secret,{expiresIn:JWT_EXP})

            const link = `http://${process.env.HOSTNAME}/reset-password/${auth.email}/${token}`

            const mail_opt = {
                from:'Twitter Analytics App',
                to:auth.email,
                subject:'Twitter Analytics App Password Recovery',
                text:'You have requested for a password reset. Follow this link: ' + link,
                html:`
                    <h4 class="h4">Hi ${name.name}!</h4>
                    <p>You have requested for a password reset, follow the following link</p>
                    <a href="${link}">${link}</a>
                    `
            }

            await sendEmail(mail_opt).then(()=>{
                return res.json(JSON.stringify({success:"Email sent to "+req.body.email}))
            }).catch((err)=>{
                return res.json(JSON.stringify({error:"Failed to send message!"}))
            })
        })

    }else{
        return res.sendStatus(500)
    }

}

module.exports = {postEmail}
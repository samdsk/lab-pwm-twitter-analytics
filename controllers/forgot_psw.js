const Auth = require('../models/Auth')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const User = require('../models/User')

const JWT_EXP = '30m'

// FIXME change the email address

const postEmail = async (req,res,next) => {
    if(req.body.email){
        Auth.findOne({email:req.body.email},async (err,auth)=>{

            if(err) return res.sendStatus(500)
            if(!auth) return res.json(JSON.stringify({error:"Invalid email"}))

            console.log("forgot pass "+auth.password);

            const name = await User.findById(auth._id)

            const secret = process.env.Server_Secret + auth.password
            const token = jwt.sign({
                email:auth.email
            },secret,{expiresIn:JWT_EXP})

            const link = `http://${process.env.HOSTNAME}/reset-password/${auth.email}/${token}`

            if(await sendEmail("sam.ds@live.com",link,name.name))
                return res.json(JSON.stringify({success:"Email sent to "+req.body.email}))
            else
                return res.json(JSON.stringify({error:"Email error!"}))
        })

    }else{
        return res.sendStatus(500)
    }

}

function sendEmail(sendTo,link,name){
    return new Promise((resolve,reject)=>{
        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:process.env.EMAIL,
                pass:process.env.EMAIL_PSW
            }
        })

        const mail_opt = {
            from:'Twitter Analytics App',
            to:sendTo,
            subject:'Twitter Analytics App Password Recovery',
            text:'You have requested for a password reset. Follow this link: ' + link,
            html:`
                <h4 class="h4">Hi ${name}!</h4>
                <p>You have requested for a password reset, follow the following link</p>
                <a href="${link}">${link}</a>
                `
        }

        transporter.sendMail(mail_opt,function(err,data){
            if(err){
                console.log(err)
                return
            }

            console.log(data)
            return resolve(true)
        })
    })

}



module.exports = {postEmail}
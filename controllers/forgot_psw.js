const Auth = require('../models/Auth')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

const getPass = async (req,res,next) => {

}
const postEmail = async (req,res,next) => {
    //const token = jwt.sign({email:login_email},process.env.Server_Secret,{expiresIn:"20s"})
    console.log(req.body)
    // if(await sendEmail(req.body.forgot_email))
    //     return res.json(JSON.stringify({success:"Email sent to "+req.body.forgot_email}))
    // else
    //     return res.json(JSON.stringify({error:"Email error!"}))

    return res.json(JSON.stringify({success:"Email error!"}))
}

function sendEmail(sendTo){
    return new Promise((resolve,reject)=>{
        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:process.env.EMAIL,
                pass:process.env.EMAIL_PSW
            }
        })

        const mail_opt = {
            from:'Twitter Analytics',
            to:sendTo,
            subject:'Testing password recovery system',
            text:'Test: Hello World!'
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



module.exports = {getPass,postEmail}
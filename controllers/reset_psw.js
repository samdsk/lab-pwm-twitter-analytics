const Auth = require('../models/Auth')
const jwt = require('jsonwebtoken')


const getReset = async (req,res,next) => {
    if(!req.body.email){
        Auth.findOne({email:req.body.email},(err,auth)=>{
            if(err) return res.json(JSON.stringify({error:"Invalid email"}))

            //const token = jwt.sign({email:login_email},process.env.Server_Secret,{expiresIn:"20s"})
            console.log(req.body)
            // if(await sendEmail(req.body.forgot_email))
            //     return res.json(JSON.stringify({success:"Email sent to "+req.body.forgot_email}))
            // else
            //     return res.json(JSON.stringify({error:"Email error!"}))
            return res.json(JSON.stringify({success:"Email sent, be sure to check spam folder too!"}))
        })

    }else{
        return res.sendStatus(500)
    }
}


const postReset = async (req,res,next) =>{

}





module.exports = {getReset,postReset}
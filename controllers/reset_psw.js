const Auth = require('../models/Auth')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const getReset = async (req,res,next) => {
    const {email,token} = req.params
    console.log(email,token);
    if(!email || !token){
        return res.sendStatus(500)
    }else{
        Auth.findOne({email:email},(err,auth)=>{
            if(err) return res.json(JSON.stringify({error:"Invalid email"}))
            console.log("pass "+auth.password);
            const secret = process.env.Server_Secret + auth.password
            try {
                const data = jwt.verify(token,secret)
                console.log(data);
                return res.render('./pages/reset_psw',{email:data.email})
            } catch (error) {
                return res.sendStatus(404)
            }
        })
    }
}


const postReset = async (req,res,next) =>{
    console.log("reset request recieved");
    const {email,password,password_confirm} = req.body
    if(!email || !password || !password_confirm) return res.json(JSON.stringify({error:"Invalid request"}))
    if(password !== password_confirm) return res.json(JSON.stringify({error:"Passwords don't match"}))

    Auth.findOne({email:email},async (err,auth)=>{
        if(err) return res.json(JSON.stringify({error:"Invalid email"}))

        const password_new = await bcrypt.hash(password,10)
        Auth.findByIdAndUpdate(auth._id,{password:password_new}).exec(function(err,auth){
            if(err) return res.sendStatus(500)
        })

        return res.json(JSON.stringify({success:"Password was changed successfully!"}))
    })
}





module.exports = {getReset,postReset}
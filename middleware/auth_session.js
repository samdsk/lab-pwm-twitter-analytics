const Auth = require('../models/Auth')

const auth_session = async (req,res,next)=>{
    if(req.session.username && req.session.email){
        const email = await Auth.findOne({email:req.session.email})
        if(email){
            console.log('Auth user:',req.session.email)
            return next()
        }else{
            req.session.destroy()
            return res.redirect('/?error=Invalid session')
        }
    }else{
        return res.redirect('/?error=Please Login first')
    }

}

module.exports = auth_session
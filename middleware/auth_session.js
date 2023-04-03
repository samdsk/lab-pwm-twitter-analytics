const Auth = require('../models/Auth')

const auth_session = async (req,res,next)=>{
    // console.log(req.session);
    if(req.session.username && req.session.email){
        const email = await Auth.findOne({email:req.session.email})
        if(email){
            console.log('session ok')
            return next()
        }else{
            req.session.destroy()
            return res.redirect('/?error=Please Login first')
        }
    }else{
        return res.redirect('/?error=Please Login first')
    }

}

module.exports = auth_session
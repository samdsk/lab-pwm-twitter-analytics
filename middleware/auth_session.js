const User = require('../models/User')

const auth_session = async (req,res,next)=>{

    if(req.session.username && req.session.email){
        console.log('username set ok')
        const user = await User.findOne({name:req.session.username})
        if(user){
            return next()
        }
        else console.log('no user')
    }else{
        return res.redirect('/?error=Please Login first')
    }

}

module.exports = auth_session
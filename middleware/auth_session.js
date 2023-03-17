const User = require('../models/User')

const auth_session = async (req,res,next)=>{
    if(req.session.username){
        console.log('username set ok')
        const user = await User.findOne({name:req.session.username})
        if(user){
            //console.log('user found')
            return next()
        }
        else console.log('no user')
    }else{        
        return res.redirect('/?error=Please Login first')
    }    

}

module.exports = auth_session
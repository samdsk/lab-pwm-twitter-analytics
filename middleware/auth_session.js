const auth_session = async (req,res,next)=>{
    if(req.session.username && req.session.email){
        console.log('Auth user:',req.session.email)
        next()
    }else{
        req.session.destroy()
        return res.redirect('/?error=Please Login first')
    }

}

module.exports = auth_session
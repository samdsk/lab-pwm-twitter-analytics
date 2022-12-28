const getProfile = async (req,res,next) => {
    req.session.email
    res.render('pages/profile',
        {
            logout:true,
            username:req.session.username,
            email: req.session.email
        })
}



module.exports = getProfile
const getSearch = async (req,res,next) => {

    res.render('pages/search',{
        logout:true,
        username:req.session.username,
        email_hash:req.session.gravatar,
        search:true
    })
}



module.exports = getSearch
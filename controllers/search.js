const getSearch = async (req,res,next) => {
    res.render('pages/search',{logout:true,username:req.session.username})
}   



module.exports = getSearch
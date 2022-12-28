const getHistory = async (req,res,next) => {
    res.render('pages/history',{logout:true,username:req.session.username})
}



module.exports = getHistory
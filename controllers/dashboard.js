// redirecting to history page
const getDashboard = async (req,res,next) =>{
    res.redirect('/dashboard/history')
}

module.exports = getDashboard
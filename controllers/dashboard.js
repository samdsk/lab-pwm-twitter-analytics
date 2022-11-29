const jwt = require("jsonwebtoken")

const getDashboard = async (req,res,next) =>{
    const {token} = req.query
    console.log(token)
    const authrized = await jwt.verify(token,process.env.Server_Secret)

    if(!authrized) return res.redirect('/?error=invalid_token')
    

    res.render('pages/dashboard')
    
}




module.exports = getDashboard
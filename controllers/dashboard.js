const jwt = require("jsonwebtoken")

const getDashboard = async (req,res,next) =>{
    const logout = req.cookies.logout
    // const {token} = req.query
    // console.log(token)

    // if(!token){
    //     console.log("no token")
    //     return res.redirect('/')
    // }
    
    // const authrized = await jwt.verify(token,process.env.Server_Secret)
    // if(!authrized) return res.redirect('/?error=invalid_token')
    

    res.render('pages/dashboard',{logout:"true"})
    
}




module.exports = getDashboard
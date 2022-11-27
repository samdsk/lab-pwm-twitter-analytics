const jwt = require('jsonwebtoken')

const auth = async (req,res,next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    console.log(authHeader);
    if(token == null) return res.status(401).send('Unauthorized')

    jwt.verify(token,process.env.Server_Secret,(err,ok)=>{
        if(err) return res.status(403).send('Credentials are not valid')
        req.user = ok
        next()
    })
}

module.exports = auth
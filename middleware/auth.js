const jwt = require('jsonwebtoken')
const {createError} = require('../errors/customError')

const auth = async (req,res,next) => {
    const authHeader = req.headers?.authorization  

    if(!authHeader || !authHeader.startsWith('Bear '))
        return next(createError(400,"No valid token"))

    const token = authHeader && authHeader.split(' ')[1]

    if(token == null) return next(createError(400,'Unauthorized'))

    jwt.verify(token,process.env.Server_Secret,(err,ok)=>{
        //if(err) return next(createError(400,'Credentials are not valid'))
        req.user = ok
        next()
    })
}

module.exports = auth
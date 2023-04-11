const {CustomError} = require('../errors/customError')

const error_handler = (err,req,res,next) => {
    console.error(err)
    if(err instanceof CustomError) return res.status(err.status_code).send(`${err.message}`)
    return res.status(500).json(JSON.stringify({error:`${err.message}`}))
}


module.exports = error_handler
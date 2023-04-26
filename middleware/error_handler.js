const {CustomError} = require('../errors/customError')

// sending errors as json obj
// FIXME verify
const error_handler = (err,req,res,next) => {
    console.error("ERROR: ",err)
    if(err instanceof CustomError) return res.status(err.status_code).send(`${err.message}`)
    return res.status(500).json({error:`${err.message}`})
}


module.exports = error_handler
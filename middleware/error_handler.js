const {CustomError} = require('../errors/customError')

const error_handler = (err,req,res,next) => {
    console.log(err)
    if(err instanceof CustomError) return res.status(err.status_code).send(`${err.message}`)
    return res.status(500).send("Something went wrong")
}


module.exports = error_handler
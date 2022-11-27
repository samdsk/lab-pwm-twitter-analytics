class CustomError extends Error{
    constructor(msg,status_code){
        super(msg)
        this.status_code = status_code
    }

}

const createError = (status,msg) => {
    return new CustomError(msg,status)
}

module.exports = {CustomError,createError}
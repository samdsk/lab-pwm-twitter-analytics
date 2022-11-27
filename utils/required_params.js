const requireParams = (params,req) => {
    const reqParamList = Object.keys(req.body)
    const hasAllRequiredParams = params.every(param =>
        reqParamList.includes(param)
    )
    return hasAllRequiredParams
}


module.exports = requireParams
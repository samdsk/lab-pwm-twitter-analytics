const Auth = require('../models/Auth')
const Person = require('../models/User')


const login = async (req,res) => {
    required_params(["login_email","login_password"],req) 
    console.log(req.body)
    res.send('Ok')
}

module.exports = login
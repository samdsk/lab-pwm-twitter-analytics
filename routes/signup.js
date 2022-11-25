const express = require('express')
const router = express.Router()
const {createUser,signupPage} = require('../controllers/signup')

router.route('/').post(createUser).get(signupPage)

module.exports = router
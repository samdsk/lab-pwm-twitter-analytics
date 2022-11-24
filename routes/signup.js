const express = require('express')
const router = express.Router()
const {signup,signup_page} = require('../controllers/signup')

router.route('/').post(signup).get(signup_page)

module.exports = router
const express = require('express')
const router = express.Router()
const {postEmail} = require('../controllers/forgot_psw')

router.route('/').post(postEmail)

module.exports = router
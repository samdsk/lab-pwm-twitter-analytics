const express = require('express')
const router = express.Router()
const {getPass,postEmail} = require('../controllers/forgot_psw')

router.route('/').get(getPass).post(postEmail)

module.exports = router
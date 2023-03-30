const express = require('express')
const router = express.Router()
const {getReset,postReset} = require('../controllers/reset_psw')

router.route('/').get(getReset).post(postReset)

module.exports = router
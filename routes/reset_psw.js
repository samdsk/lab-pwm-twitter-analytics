const express = require('express')
const router = express.Router()
const {getReset,putReset} = require('../controllers/reset_psw')

router.route('/:email/:token').get(getReset)
router.route('/').put(putReset)

module.exports = router
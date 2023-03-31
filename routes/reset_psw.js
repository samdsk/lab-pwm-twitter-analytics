const express = require('express')
const router = express.Router()
const {getReset,postReset} = require('../controllers/reset_psw')

router.route('/:email/:token').get(getReset)
router.route('/').post(postReset)

module.exports = router
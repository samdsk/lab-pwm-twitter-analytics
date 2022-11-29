const express = require('express')
const router = express.Router()
const dashboard = require('../controllers/dashboard')


router.get('*',dashboard)

module.exports = router
const express = require('express')
const router = express.Router()
const twitter = require('../controllers/twitter')

router.route('/').post(twitter)

module.exports = router
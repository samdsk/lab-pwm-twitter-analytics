const express = require('express')
const router = express.Router()
const {getResults} = require('../controllers/results')

router.route('/').get(getResults)

module.exports = router
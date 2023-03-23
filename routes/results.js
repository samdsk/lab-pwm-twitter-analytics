const express = require('express')
const router = express.Router()
const {getResults,removeResult} = require('../controllers/results')

router.route('/').get(getResults).delete(removeResult)

module.exports = router
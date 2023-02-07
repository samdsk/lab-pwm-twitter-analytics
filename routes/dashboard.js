const express = require('express')
const router = express.Router()
const dashboard = require('../controllers/dashboard')
const profile = require('../controllers/profile')
const history = require('../controllers/history')
const search = require('../controllers/search')

router.get('/profile',profile)
router.get('/history',history)
router.get('/search',search)
router.get('/',dashboard)

module.exports = router
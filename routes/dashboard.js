const express = require('express')
const router = express.Router()
const dashboard = require('../controllers/dashboard')
const {getProfile,postProfile,deleteProfile} = require('../controllers/profile')
const history = require('../controllers/history')
const search = require('../controllers/search')

router.get('/profile',getProfile).post('/profile',postProfile).delete('/profile',deleteProfile)
router.get('/history',history)
router.get('/search',search)
router.get('/',dashboard)

module.exports = router
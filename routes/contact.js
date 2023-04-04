const express = require('express')
const router = express.Router()
const {getContact,postContact} = require('../controllers/contact')

router.route('/').get(getContact).post(postContact)

module.exports = router
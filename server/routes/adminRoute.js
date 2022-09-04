const express = require('express')
const { route } = require('./authRoutes')
const router = express.Router()

const { login } = require('../controllers/admin/adminAuthController')

// Admin controls
router.
    post('/login', login)

// Post login routes should require user.isActive
module.exports = router
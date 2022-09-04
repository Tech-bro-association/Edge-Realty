const express = require('express')
const router = express.Router()

const { login, signup } = require('../controllers/admin/adminAuthController')

// Admin controls
router.
    post('/signup', signup).
    // post('/verify', ),
    post('/login', login)

// Post login routes should require user.isActive
module.exports = router
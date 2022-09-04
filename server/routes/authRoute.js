const express = require('express')
const router = express.Router()

const { signup, verifyEmail, login, passwordReset, confirmResetAndChangePassword } = require('../controllers/authController')

router.post('/signup', signup)
router.post('/verify', verifyEmail)
router.post('/login', login)
router.
    post('/password/reset', passwordReset).
    put('/password/confirmreset', confirmResetAndChangePassword)

 
module.exports = router
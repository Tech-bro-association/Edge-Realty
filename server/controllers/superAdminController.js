
const _ = require('lodash')
const mongoose = require('mongoose')

// Models
const { VerificationToken, ResetToken } = require('../models/tokenModel'),
    { Status } = require('../../models/accountStatusModel'),
    { Password } = require('../models/passwordModel.js');
const { BoatOperator, EndUser, Founder, Staff, Ticketer } = require('../models/usersModel');

// Middlewares
const asyncWrapper = require('../../middlewares/asyncWrapper'),
    { CustomAPIError, createCustomError, BadRequestError, UnauthorizedError } = require('../../middlewares/customError');

// Utilities
const { sendMail } = require("./utils/mailer"),
    { hashPassword, checkHash } = require('./utils/hash'),
    { decodeJWT } = require('./utils/jwt'),
    { statusCode } = require('./utils/statusCode'),
    { EmailMsg } = require('./utils/messageTemplates')

// Constants
const users = {
    "BoatOperator": BoatOperator,
    "Founder": Founder,
    "Staff": Staff,
    "EndUser": EndUser,
};
const control_admin = {
    "Founder": Founder,
    "SuperAdmin": SuperAdmin
}
const config = process.env


/* AUTHORIZE ADMIN REQUEST
*/
const authorizeAdminRequest = async (req) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer')) { throw new UnauthorizedError('Authentication invalid') }

        const jwtToken = authHeader.split(' ')[1]
        const payload = decodeJWT(jwtToken)
        console.log(payload)

        const allowedRoles = ["SuperAdmin", "Founder"]
        if (!allowedRoles.includes(payload.role)) { return false }

        const Admin = control_admin[payload.role],
            currAdmin = await Admin.findOne({ email: payload.email })
        if (currAdmin.isActive) { return true }

        return false
    } catch (error) {
        throw "An error occured"
    }
}

const getInactiveUserAccs = asyncWrapper(async (req, res, next) => {

})

const activateUserAcc = asyncWrapper(async (req, res, next) => {

})

const deactivateUserAcc = asyncWrapper(async (req, res, next) => {

})


/* ADD NEW USERS MANUALLY - Requires an existing ADMIN (Founder, SuperAdmin)
    SuperAdmin-> Can add all users
    Founder -> Can add all users except SuperAdmin
*/
const addNewUser = asyncWrapper(async (req, res, next) => {
    const authorized = await authorizeAdminRequest(req)
    if (!authorized) { throw new UnauthorizedError("A Verified/Activated Admin is required for this request") }
    const { firstname, lastname, email, password, phonenumber, role } = req.body,
        User = users[role];

    const newAdmin = await User.create({ firstname, lastname, email, password, phonenumber, role });

    await Password.create({ role: role, user: newAdmin, password: password });
    await Status.create({ role: role, user: newAdmin, isActive: true, isVerified: true })

    const currAdmin = await User.findOne({ email, role }).populate("password status")
    console.log(currAdmin)

    jwt_token = newAdmin.createJWT()
    return res.status(201).send({ user: { firstname, lastname } })
})

module.exports = {
    addNewUser,
    activateUserAcc,
    deactivateUserAcc
}
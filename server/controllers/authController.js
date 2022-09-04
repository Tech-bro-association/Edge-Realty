const _ = require('lodash')
const mongoose = require('mongoose')

// Models
const { VerificationToken, ResetToken } = require('../models/tokenModel'),
    { Status } = require('../models/accountStatusModel'),
    { Password } = require('../models/passwordModel.js');
const {EndUser, Agent, Admin } = require('../models/usersModel');

// Middlewares
const asyncWrapper = require('../middlewares/asyncWrapper'),
    { CustomAPIError, createCustomError, BadRequestError, UnauthorizedError } = require('../middlewares/customError');

// Utilities
const { sendMail } = require("./utils/mailer"),
    { hashPassword, checkHash } = require('./utils/hash'),
    { decodeJWT } = require('./utils/jwt'),
    { statusCode } = require('./utils/statusCode'),
    { EmailMsg } = require('./utils/messageTemplates')

// Constants
const users = {
    "EndUser": EndUser,
    "Admin": Admin,
    "Agent": Agent
};
const config = process.env


// HELPERS ---
const checkIfUserExists = asyncWrapper(async (user_role, user_email, next) => {
    let User = users[user_role];
    return User.findOne({ email: user_email })
})

const validateEmail = (email) => {
    return String(email).
        toLowerCase().
        match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};
// --- HELPERS


/* SIGNUP for new Accounts */
const signup = asyncWrapper(async (req, res, next) => {
    let jwt_token;
    console.log(req.body)
    if (!req.body.role) { throw new BadRequestError("Missing required parameter: Validation failed") }
    const { firstname, lastname, email, role, password, phonenumber } = req.body,
        User = users[role];

    if (!validateEmail(email)) { throw new BadRequestError("Email validation failed") }

    let match = await checkIfUserExists(role, email, next)
    if (match) {
        currUser = await User.findOne({ email: email, role: role }).populate('status');
        console.log(currUser)
        if (!currUser.status.isVerified || !currUser.status) {
            jwt_token = currUser.createJWT()

            let new_token = Math.floor(100000 + Math.random() * 900000);
            await VerificationToken.findOneAndUpdate({ user: currUser._id }, { token: new_token }, { new: true });
            await sendMail(new EmailMsg(email, firstname, new_token).userAccountVerification());

            return res.status(statusCode.BADREQUEST).send({ message: "User exists, please verify your account", token: jwt_token })
        }
        throw new BadRequestError('User already registered please login')
    }

    const newUser = await User.create(req.body);
    
    await Password.create({ role: role, user: newUser, password: password });

    if (role == "EndUser"){ await Status.create({ role: role, user: newUser, isActive: true }) }
    else { await Status.create({ role: role, user: newUser })}
    
    const newVerificationToken = await VerificationToken.create({ role: role, user: newUser });

    await sendMail(new EmailMsg(email, firstname, newVerificationToken.token).userAccountVerification())
    jwt_token = newUser.createJWT()

    return res.status(201).send({ user: { firstname, lastname }, token: jwt_token })
})


/* VERIFY EMAIL */
const verifyEmail = asyncWrapper(async (req, res, next) => {
    const { verification_token } = req.body
    if (!req.body.verification_token) { throw new BadRequestError("Missing required parameter: Validation failed") }


    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer')) { throw new UnauthorizedError('Authentication invalid') }

    const jwtToken = authHeader.split(' ')[1]
    const payload = decodeJWT(jwtToken)

    const User = users[payload.role],
        currUser = await User.findOne({ _id: payload._id }).populate('verification_token status')
    console.log(currUser)
    if (currUser.status.isVerified) { throw new BadRequestError('User Account already verified') }

    if (currUser.verification_token.token != verification_token) {
        throw new UnauthorizedError('Invalid verification code')
    }

    await Status.findOneAndUpdate({user: payload._id}, {isVerified: true})
    await VerificationToken.findOneAndDelete({ user: payload._id })

    return res.status(statusCode.OK).send({ message: "User Email verified successfully" })
})



const login = asyncWrapper(async (req, res, next) => {
    let jwt_token;

    const { role, email, password } = req.body;
    if (!role || !email || !password) { throw new BadRequestError("Missing required parameter: Validation failed") }

    const User = users[role],
        currUser = await User.findOne({ email, role }).populate('password status');

    if (!currUser) { throw new BadRequestError('Invalid login credentials') }
    if (!currUser.status.isVerified) {
        jwt_token = currUser.createJWT()

        const new_token = Math.floor(100000 + Math.random() * 900000);
        await VerificationToken.findOneAndUpdate({ user: currUser._id }, { token: new_token }, { new: true });
        await sendMail(new EmailMsg(email, currUser.firstname, new_token).userAccountVerification());

        return res.status(statusCode.BADREQUEST).send({ message: "Please verify your account", token: jwt_token })
    }

    const match = await checkHash(password, currUser.password.password)
    if (!match) {
        throw new UnauthorizedError("Login credentials invalid")
    }
    jwt_token = currUser.createJWT()

    return res.status(statusCode.OK).send({ message: "Login successful", token: jwt_token })
})


const passwordReset = asyncWrapper(async (req, res, next) => {
    if (!req.body.role) { throw new BadRequestError("Missing required parameter: Validation failed") }

    const { email, role } = req.body
    const User = users[role],
        currUser = await User.findOne({ email, role })

    if (!currUser) { throw new BadRequestError('User does not exist') }
    const reset_token = Math.floor(100000 + Math.random() * 900000).toString(),
        reset_access_token = await currUser.createResetToken(reset_token);

    await sendMail(new EmailMsg(email, currUser.firstname, reset_token).passwordReset())
    return res.status(statusCode.CREATED).send({ message: "Password reset code sent you user email", token: reset_access_token })
})


const confirmResetAndChangePassword = asyncWrapper(async (req, res, next) => {
    const { reset_token, password } = req.body
    if (!reset_token || !password) { throw new BadRequestError("Missing required parameter: Validation failed") }

    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer')) { throw new UnauthorizedError('Authentication invalid') }

    const jwtToken = authHeader.split(' ')[1]
    const payload = decodeJWT(jwtToken)
    const currUserReset = await ResetToken.findOne({ user: payload._id })

    if (!currUserReset) { throw BadRequestError(' Reset token is invalid') }
    if (reset_token != payload.reset_token) { throw new BadRequestError(' Reset token is invalid ') }
    if (reset_token != currUserReset.token) { throw new BadRequestError(' Reset token is invalid ') }

    await ResetToken.findOneAndUpdate({ user: payload._id, role: payload.role }, { token: null })

    const hash = await hashPassword(password)
    await Password.findOneAndUpdate({ user: payload._id }, { password: hash }, { new: true }).populate('user')

    return res.status(statusCode.OK).send({ message: "Password Reset successful" })
})

module.exports = {
    signup,
    verifyEmail,
    login,
    passwordReset,
    confirmResetAndChangePassword
}
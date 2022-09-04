
const _ = require('lodash')
const mongoose = require('mongoose')

// Models
const { SuperAdmin} = require('../../models/usersModel');
const { VerificationToken, ResetToken } = require('../../models/tokenModel'),
    { Status } = require('../../models/accountStatusModel'),
    { Password } = require('../../models/passwordModel.js');

// Middlewares
const asyncWrapper = require('../../middlewares/asyncWrapper'),
    { BadRequestError, UnauthorizedError } = require('../../middlewares/customError');

// Utilities / Helpers
const { mailActivationCodes, generateActivationCodes } = require("./helpers"),
    { hashPassword, checkHash } = require('../utils/hash'),
    { decodeJWT } = require('../utils/jwt'),
    { statusCode } = require('../utils/statusCode');

// Constants
const users = {
    "SuperAdmin": SuperAdmin,
};
const config = process.env
const role = "SuperAdmin"


/*  SIGNUP FOR NEW ADMIN
    Checks for duplicate registration
    Creates new Admin
    Sets new Admin isActive status to false -> restricts Administrative access
    Creates, Stores and sends 3 seperate verification tokens  to specified project heads

    Returns Authorization Bearer Token, and Users name
*/
const signup = asyncWrapper(async (req, res, next) => {
    let jwt_token;
    const { firstname, lastname, email, password, phonenumber} = req.body;

    let match = await SuperAdmin.findOne({ email })
    if (match) {
        const currAdmin = await SuperAdmin.findOne({ email: email}).populate('status');
        if (currAdmin.status.isActive) { throw new BadRequestError('Super Admin account is active, please login')}
        if (!currAdmin.status.isVerified) {
            jwt_token = currAdmin.createJWT()
            const { head_token_1, head_token_2, user_token } = generateActivationCodes(),
                token = head_token_1 + head_token_2 + user_token;
                await VerificationToken.findOneAndUpdate({ user: currAdmin._id }, { token }, { new: true });

            await mailActivationCodes(head_token_1, head_token_2, user_token, email, firstname)
            return res.status(statusCode.BADREQUEST).send({ message: "SuperAdmin exists, please activate account", token: jwt_token })
        }
        throw new BadRequestError('User already registered please login')
    }

    const newAdmin = await SuperAdmin.create({ firstname, lastname, email, password, phonenumber});

    await Password.create({ role, user: newAdmin, password: password });
    await Status.create({ role, user: newAdmin, isActive: false, isVerified: false })

    const { head_token_1, head_token_2, user_token } = generateActivationCodes(),
        token = head_token_1 + head_token_2 + user_token;

    await VerificationToken.create({user: newAdmin, token, role })
    await mailActivationCodes(head_token_1, head_token_2, user_token, email, firstname)

    jwt_token = newAdmin.createJWT()

    return res.status(201).send({ user: { firstname, lastname }, token: jwt_token })
})


/*  ACCOUNT ACTIVATION FOR NEW SUPER ADMIN
    Requires Authorization Bearer token, verification tokens from head1, head2 and user
*/
const activateNewSuperAdminAcc = asyncWrapper(async (req, res, next) => {
    const { head_token_1, head_token_2, user_token } = req.body,
        verification_token = head_token_1 + head_token_2 + user_token;

    if (!head_token_1 || !head_token_2 || !user_token) { throw new BadRequestError('Missing Required parameter: Validation failed') }

    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer')) { throw new UnauthorizedError('Authentication invalid') }

    const jwtToken = authHeader.split(' ')[1]
    const payload = decodeJWT(jwtToken),
        currAdmin = await Admin.findOne({ _id: payload._id }).populate('verification_token status');
    if (currAdmin.status.isVerified) { throw new BadRequestError('User Account already verified') }
    if (currAdmin.verification_token.token != verification_token) { throw new UnauthorizedError('Invalid verification code') }

    await Status.findOneAndUpdate({user: payload._id}, {isVerified: true, isActive: true})
    await VerificationToken.findOneAndDelete({ user: payload._id })

    return res.status(statusCode.OK).send({ message: "SuperAdmin account activated successfully" })
})


const login = asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) { throw new BadRequestError("Missing required parameter: Validation failed") }

    const currUser = await SuperAdmin.findOne({ email }).populate('password status');
    if (!currUser) { throw new BadRequestError('Invalid login credentials') }

    const match = await checkHash(password, currUser.password.password)
    if (!match) { throw new UnauthorizedError("Login credentials invalid") }

    const jwt_token = currUser.createJWT()

    return res.status(statusCode.OK).send({ message: "Login successful", token: jwt_token })
})


module.exports = {
    signup,
    login,
    activateNewSuperAdminAcc
}
const jwt = require("jsonwebtoken");
const asyncWrapper = require("../asyncWrapper");
const { UnauthorizedError } = require('../../middlewares/customError')
const { decodeJWT } = require("../../controllers/utils/jwt");

const config = process.env;

const { Admin, Agent, EndUser } = require('../../models/usersModel');
const users = {
  "EndUser": EndUser,
  "Agent": Agent,
  "Admin": Admin
}

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

const authAdmin = asyncWrapper(async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer')) { throw new UnauthorizedError('Authentication required') }

  const jwtToken = authHeader.split(' ')[1]
  const payload = decodeJWT(jwtToken)
  const currAdmin = await Admin.findOne({ _id: payload._id });

  if (!currAdmin) { throw new UnauthorizedError("Unauthorized access") }

  next()
})

const authAgent = asyncWrapper(async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer')) { throw new UnauthorizedError('Authentication required') }

  const jwtToken = authHeader.split(' ')[1]
  const payload = decodeJWT(jwtToken)
  const currAgent = await Agent.findOne({ _id: payload._id });

  if (!currAgent) { throw new UnauthorizedError("Unauthorized access") }

  next()
})

const authEndUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer')) { throw new UnauthorizedError('Authentication required') }
  
    const jwtToken = authHeader.split(' ')[1]
    const payload = decodeJWT(jwtToken)
    const currUser = await EndUser.findOne({ _id: payload._id });
  
    if (!currUser) { throw new UnauthorizedError("Unauthorized access") }
  
    next()
  } catch (error) {
    throw error
  }

  // return next()
}

module.exports = {
  verifyToken,
  authAdmin,
  authAgent,
  authEndUser
}
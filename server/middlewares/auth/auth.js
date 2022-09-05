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

const authenticateRequest = asyncWrapper(async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer')) { throw new UnauthorizedError('Authentication required') }

  const jwtToken = authHeader.split(' ')[1]
  const payload = decodeJWT(jwtToken)
  const User = users[payload.role],
    currUser = await User.findOne({ _id: payload._id });

  if (!currUser) { throw new UnauthorizedError("Unauthorized access") }

  console.log('Authorized')
  next()
})

module.exports = {
  verifyToken,
  authenticateRequest
}
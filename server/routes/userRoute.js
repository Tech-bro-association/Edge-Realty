const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const passwordController = require("../controllers/passwordController")

router.post("/register", userController.addNewUser);
router.post("/updatedata", userController.updateUserData);
router.post("/updatepassword", userController.updateUserPassword);
router.post("/login", userController.loginUser);
router.post("/reset", userController.resetUserPassword)
router.post("/confirmtoken", passwordController.confirmResetToken)

module.exports = router;

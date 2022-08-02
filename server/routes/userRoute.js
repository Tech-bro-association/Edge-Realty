const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

router.post("/register", userController.addNewUser);
router.post("/updatedata", userController.updateUserData);
router.post("/updatepassword", userController.updateUserPassword);

module.exports = router;

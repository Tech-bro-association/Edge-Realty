const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

router.post("/register", userController.addNewUser);
router.post("/updatedata", userController.updateUserData);
router.post("/find", userController.findUser)

module.exports = router;

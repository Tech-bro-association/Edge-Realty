const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

router.post("/register", userController.addNewUser);
router.post("/updatedata", userController.updateUserData);

module.exports = router;

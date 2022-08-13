const express = require("express");
const router = express.Router();

const passwordController = require("../controllers/passwordController")

router.post("/resetpassword", passwordController.resetClientPassword);
router.post("/confirmtoken", passwordController.confirmResetToken);
router.post("/changepassword", passwordController.changeOldPassword);


module.exports = router;

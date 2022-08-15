const express = require("express");
const router = express.Router();

const {resetClientPassword, changeOldPassword, authenticateClientLogin} = require("../controllers/utils/auth/passwordAuth")
const { confirmResetToken  } = require("../controllers/utils/auth/resetToken")

router.post("/resetpassword", resetClientPassword);
router.post("/confirmtoken", confirmResetToken);
router.post("/changepassword", changeOldPassword);
router.post('/login', authenticateClientLogin);

module.exports = router;

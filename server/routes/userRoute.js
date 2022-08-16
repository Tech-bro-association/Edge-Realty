const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

router.post("/register", userController.addNewUser);
router.post("/updatedata", userController.updateUserData);
router.post("/cart/add", userController.addPropertyToCart);
router.post("/cart/remove", userController.removePropertyFromCart);
router.post("/cart/get", userController.getCartItems);
router.post("/cart/clear", userController.clearCart);
router.post("/cart/checkout", userController.checkoutCart);
router.post("/search", userController.searchProperties);
router.post("/newsletter", userController.signupForNewsletter);



module.exports = router;

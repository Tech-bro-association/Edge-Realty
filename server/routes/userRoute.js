const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const cartController = require("../controllers/cartController");

router.post("/register", userController.addNewUser);
router.post("/updatedata", userController.updateUserData);
router.post("/cart/add", cartController.addPropertyToCart);
router.post("/cart/remove", cartController.removePropertyFromCart);
router.post("/cart/get", cartController.getCartItems);
router.post("/cart/clear", cartController.clearCart);
router.post("/cart/checkout", cartController.checkoutCart);
router.post("/search", userController.searchProperties);
router.post("/newsletter", userController.signupForNewsletter);



module.exports = router;

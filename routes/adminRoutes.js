const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");

// Admin signup and login routes
router.post("/signup", adminController.signup);
router.post("/login", adminController.login);

// Hypothetical admin profile management route
// router.patch("/profile", adminController.updateProfile);

module.exports = router;

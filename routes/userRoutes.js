const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");

router.post("/signup", adminController.signup);

router.post("/login", adminController.login);

module.exports = router;

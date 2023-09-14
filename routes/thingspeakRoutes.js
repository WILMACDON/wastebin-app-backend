const express = require("express");
const router = express.Router();
const thingspeakController = require("../controller/thingspeakController");

// Route to get ThingSpeak data
router.get("/get-data", thingspeakController.getData);

module.exports = router;

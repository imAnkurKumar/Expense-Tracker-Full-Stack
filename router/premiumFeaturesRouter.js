const express = require("express");
const premiumFeaturesController = require("../controllers/premiumFeaturesController");
const userAuthentication = require("../middleware/auth");
const router = express.Router();

router.get(
  "/showLeaderboard",
  userAuthentication,
  premiumFeaturesController.getUserLeaderboard
);
module.exports = router;

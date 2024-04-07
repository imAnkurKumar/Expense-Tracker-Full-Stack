const express = require("express");
const purchaseMembershipController = require("../controllers/purchaseMembershipController");
const userAuthentication = require("../middleware/auth");
const router = express.Router();

router.get(
  "/premiumMembership",
  userAuthentication,
  purchaseMembershipController.purchaseMembership
);

router.post(
  "/updateTransactionstatus",
  userAuthentication,
  purchaseMembershipController.updateTransactionstatus
);
module.exports = router;

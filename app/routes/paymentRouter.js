const express = require("express");
const router = express.Router();
const paymentControll = require("../controllers/paymentControllers");

// Router.route("/checker").get(paymentControll.checker);

router.route("/").post(paymentControll.paymentRequest);

module.exports = router;

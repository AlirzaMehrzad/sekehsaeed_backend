const express = require("express");
const router = express.Router();
const paymentControll = require("../controllers/paymentControllers");

// Router.route("/checker").get(paymentControll.checker);

router.route("/").post(paymentControll.paymentRequest);
router.route("/verify").get(paymentControll.paymentVerify);
router.route("/history").post(paymentControll.getPayment);
router.route("/factor").post(paymentControll.getPayment);

module.exports = router;

const express = require("express");
const router = express.Router();
const paymentControll = require("../controllers/paymentControllers");

router.route("/").post(paymentControll.paymentRequest);
router.route("/verify").get(paymentControll.paymentVerify);
router.route("/history").post(paymentControll.getPayment);
router.route("/invoice").post(paymentControll.Invoice);

module.exports = router;

const ZarinpalCheckout = require("zarinpal-checkout");
const PaymentModel = require("../models/paymentModel");
/**
 * Create ZarinPal
 * @param {String} `2b5b7f02-3a09-11ea-9071-000c295eb8fc` [Merchant ID]
 * @param {Boolean} true [toggle `Sandbox` mode]
 */
const zarinpal = ZarinpalCheckout.create(
  "2b5b7f02-3a09-11ea-9071-000c295eb8fc",
  true
);

const paymentControll = {
  paymentRequest: async (req, res, next) => {
    try {
      const total = req.body.total;

      /**
       * PaymentRequest [module]
       * @return {String} URL [Payement Authority]
       */

      const payment = new PaymentModel({
        price: total,
      });

      zarinpal
        .PaymentRequest({
          Amount: total, // In Tomans
          CallbackURL: "http://localhost:4001/api/v5/payment/verify",
          Description: "A Payment from Node.JS",
          Email: "hi@siamak.work",
          Mobile: "09120000000",
        })
        .then((response) => {
          if (response.status === 100) {
            res.send({
              status: "success",
              url: response.url,
            });
          }
        })
        .catch((err) => {
          console.error(err);
        });
    } catch (error) {
      next(error);
    }
  },

  paymentVerify: async (req, res, next) => {
    if (req.query.Status && req.query.Status !== "OK") {
      console.log("Payment Failed");
      res.redirect("/");
    }
  },
};

module.exports = paymentControll;

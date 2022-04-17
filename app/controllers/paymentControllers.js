const ZarinpalCheckout = require("zarinpal-checkout");
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
      /**
       * PaymentRequest [module]
       * @return {String} URL [Payement Authority]
       */
      zarinpal
        .PaymentRequest({
          Amount: "1200", // In Tomans
          CallbackURL: "http://localhost:4001/api/v5/payment",
          Description: "A Payment from Node.JS",
          Email: "hi@siamak.work",
          Mobile: "09120000000",
        })
        .then((res) => {
          if (res.status === 100) {
            // return res.status(200).send({ url: res.url });
            console.log(res.url);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = paymentControll;

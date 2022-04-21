const ZarinpalCheckout = require("zarinpal-checkout");
const PaymentModel = require("../models/paymentModel");
const UserModel = require("../models/userModel");
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
      const userID = req.body.userID;
      const total = req.body.total;
      const mobile = req.body.userMobile;
      const firstName = req.body.firstName;
      const lastName = req.body.lastName;
      const address = req.body.address;
      const cart = req.body.cart;

      /**
       * PaymentRequest [module]
       * @return {String} URL [Payement Authority]
       */

      zarinpal
        .PaymentRequest({
          Amount: total, // In Tomans
          CallbackURL: "http://localhost:4001/api/v5/payment/verify",
          Description: "خرید از درگاه بانکی اکسپوتک",
          Email: "hi@siamak.work",
          Mobile: mobile,
        })
        .then((response) => {
          if (response.status === 100) {
            res.send({
              status: "success",
              url: response.url,
            });
            let pay = new PaymentModel({
              user_id: userID,
              fname: firstName,
              lname: lastName,
              address: address,
              mobile: mobile,
              price: total,
              cart: cart,
              resnumber: response.authority,
            });
            pay.save();
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
    let payment = await PaymentModel.findOne({
      resnumber: req.query.Authority,
    });

    zarinpal
      .PaymentVerification({
        Amount: payment.price,
        Authority: req.query.Authority,
      })
      .then((response) => {
        if (response.status !== 100) {
          res.redirect("http://localhost:3000/cart");
        } else {
          payment.set({ status: true });

          payment.save();
          res.redirect("http://localhost:3000");
        }
      })
      .catch((err) => {
        next(err);
      });
  },
};

module.exports = paymentControll;

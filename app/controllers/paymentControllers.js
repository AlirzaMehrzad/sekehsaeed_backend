const ZarinpalCheckout = require("zarinpal-checkout");
const PaymentModel = require("../models/paymentModel");
const UserModel = require("../models/userModel");
const ProductsModel = require("../models/productModel");
const moment = require("jalali-moment");
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

            var createTransaction =
              Date.now() - Math.floor(Math.random() * 100);

            var clock = getClockService();

            let pay = new PaymentModel({
              transactionID: createTransaction,
              user_id: userID,
              fname: firstName,
              lname: lastName,
              address: address,
              mobile: mobile,
              price: total,
              cart: cart,
              resnumber: response.authority,
              time: moment().locale("fa").format("YYYY/M/D"),
              clock: clock,
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
          res.redirect("http://localhost:3000/paymentFail");
        } else {
          for (let i = 0; i < payment.cart.length; i++) {
            let products = payment.cart[i];
            ProductsModel.findById(products._id, (err, product) => {
              if (err) {
                console.log(err);
              } else {
                product.quantity -= products.quantity;
                product.save();
              }
            });
          }

          payment.set({ status: true, clock: getClockService() });
          UserModel.findOne({ _id: payment.user_id }, (err, user) => {
            if (err) {
              console.log(err);
            } else {
              user.cart = [];
              user.save();
            }
          });
          payment.save();
          res.redirect("http://localhost:3000/paymentSuccess");
        }
      })
      .catch((err) => {
        next(err);
      });
  },

  getPayment: async (req, res, next) => {
    try {
      const userID = req.body.userID;
      const payments = await PaymentModel.find({ user_id: userID });
      res.send(payments);
    } catch (error) {
      next(error);
    }
  },

  Invoice: async (req, res, next) => {
    try {
      const userID = req.body.userID;
      const lastPayment = await PaymentModel.find({ user_id: userID })
        .sort({ _id: -1 })
        .limit(1);
      res.send(lastPayment);
    } catch (error) {
      next(error);
    }
  },
};

function getClockService() {
  var today = new Date();
  var clock =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return clock;
}

module.exports = paymentControll;

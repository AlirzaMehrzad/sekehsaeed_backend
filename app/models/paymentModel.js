const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    transactionID: {
      type: Number,
      required: true,
    },

    user_id: {
      type: String,
      required: true,
    },

    fname: {
      type: String,
      required: true,
    },

    lname: {
      type: String,
      required: true,
    },

    address: {
      type: Object,
      required: true,
    },

    mobile: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    status: {
      type: Boolean,
      default: false,
    },

    cart: {
      type: Array,
      required: true,
    },

    resnumber: { type: String, required: true },

    time: {
      type: String,
      required: true,
    },

    clock: {
      type: String,
      required: true,
    },

    deliveryMethod: {
      type: String,
    },

    deliveryCost: {
      type: Number,
    },

    taxCost: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);

const mongoose = require("mongoose");

const sliderSchema = new mongoose.Schema(
  {
    image: { type: Object, require: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Slider", sliderSchema);

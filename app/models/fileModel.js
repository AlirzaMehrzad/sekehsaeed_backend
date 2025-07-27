const mongoose = require("mongoose");
const { Schema } = mongoose;

const fileModel = new mongoose.Schema(
  {
    image: { type: Object, require: true },
    url: { type: String },
    companyId: { type: Schema.Types.ObjectId, trim: true },
    reference: { type: Schema.Types.ObjectId }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("files", fileModel);

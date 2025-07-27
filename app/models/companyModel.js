const mongoose = require("mongoose");
const { Schema } = mongoose;

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true },
  contacts: { type: Array },
  owner: {type: Schema.Types.ObjectId},
  activation: { type: Boolean , default: true},
  expireDate: { type: Date, required: true },
  phone: { type: String },
  mobile: { type: String },
  createdAt: { type: Date, default: Date.now },
  updateAt: { type: Date, default: Date.now },
});

const companyModel = mongoose.model("Company", companySchema);
module.exports = companyModel;

const mongoose = require("mongoose");
const { Schema } = mongoose;

const transferSchema = new mongoose.Schema({
	name: { type: String, required: true, trim: true },
	companyId: { type: Schema.Types.ObjectId, required: true, trim: true },
	mobile: { type: String },
	cartNumber: { type: String, required: false },
	date: { type: Date },
	jalaliDate: { type: String },
	actions: { type: Array },
	caption: { type: String },
	phone: { type: String },
	createdBy: { type: Schema.Types.ObjectId },
	createdAt: { type: Date, default: Date.now },
	updateAt: { type: Date, default: Date.now },
	price: { type: Number, required: true },
	payed: { type: Number, default: 0 },
	addedToSystem: { type: Boolean, default: false },
	finished: { type: Boolean, default: false },
	deleted: { type: Boolean, default: false },
});

const transferModel = mongoose.model("Transfer", transferSchema);
module.exports = transferModel;

const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
	fname: { type: String, required: true, trim: true },
	lname: { type: String, required: true, trim: true },
	companyId: { type: Schema.Types.ObjectId, trim: true },
	mobile: { type: String, required: true, unique: true },
	password: { type: String },
	address: { type: String },
	verifyCode: { type: Number },
	email: { type: String },
	role: { type: Number, default: 0 },
	resetPasswordToken: { type: String },
	resetPasswordExpires: { type: Date },
	cartNumber: { type: String },
	isActive: { type: Boolean, default: true },
	isAdmin: { type: Boolean, default: false },
	createdAt: { type: Date, default: Date.now },
	updateAt: { type: Date, default: Date.now },
});

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;

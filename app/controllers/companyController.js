const companyModel = require("../models/companyModel");
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");

const companyControll = {
	getCompenies: async (req, res, next) => {
		try {
			const categories = await categoryModel.find();
			res.send({ categories });
		} catch (error) {
			next(error);
		}
	},

	createCompany: async (req, res, next) => {
		try {
			const { companyName, mobile, expireDate, fname, lname, password, role } =
				req.body;

			const user = await userModel.findOne({ mobile });
			if (user) {
				return res
					.status(400)
					.send({ message: "برای این شماره همراه قبلا پنل ایجاد شده است" });
			}

			const passwordHash = await bcrypt.hash(password, 10);
			const firstUser = new userModel({
				mobile,
				fname,
				lname,
				password: passwordHash,
				role,
			});
			await firstUser.save();

			//create company
			const currentDate = new Date(); // Current date and time
			let calculatedExpireDate = new Date(currentDate);
			if (expireDate == 50) {
				calculatedExpireDate.setFullYear(currentDate.getFullYear() + 50);
			} else if (expireDate > 6) {
				calculatedExpireDate.setFullYear(currentDate.getFullYear() + 1);
			} else {
				calculatedExpireDate.setMonth(currentDate.getMonth() + expireDate);
			}

			const newCompany = await await companyModel.create({
				companyName,
				expireDate: calculatedExpireDate,
				contacts: [firstUser._id],
				owner: firstUser._id,
			});
			await newCompany.save();

			firstUser.companyId = newCompany._id;
			await firstUser.save();

			res.status(201).send({
				success: true,
				message: "کسب و کار جدید اضافه شد",
			});
		} catch (error) {
			next(error);
		}
	},

	deleteCompany: async (req, res, next) => {
		try {
			await categoryModel.findByIdAndDelete(req.params.id);
			res.status(201).send({
				message: "دسته بندی با موفقیت حذف شد",
			});
		} catch (error) {
			next(error);
		}
	},

	updateCompany: async (req, res, next) => {
		try {
			const { en_name, pe_name } = req.body;
			await categoryModel.findOneAndUpdate(
				{ _id: req.params.id },
				{ en_name },
				{ pe_name }
			);
			res.status(201).send({
				message: "دسته بندی با موفقیت ویرایش شد",
			});
		} catch (error) {
			next(error);
		}
	},
};

module.exports = companyControll;

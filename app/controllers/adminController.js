const userModel = require("../models/userModel");
const CompanyModel = require("../models/companyModel");
const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const AdminControll = {
	registerAdmin: async (req, res, next) => {
		try {
			const { fname, lname, mobile, password, email, role } = req.body;

			const passwordHash = await bcrypt.hash(password, 10);
			const newUser = new userModel({
				fname,
				lname,
				mobile,
				password: passwordHash,
				email,
				role: 1024,
				isAdmin: true,
			});
			await newUser.save();

			const accesstoken = creatAccessToken({ id: newUser._id });
			const refreshtoken = createRefreshToken({ id: newUser._id });

			res.cookie("refreshtoken", refreshtoken, {
				httpOnly: true,
				path: "/api/v1/user/refresh_token",
			});

			res.status(201).send({
				success: true,
				message: `${newUser.fname} عزیز به سامانه خوش آمدید`,
				token: accesstoken,
				//newUser,
			});
		} catch (error) {
			next(error);
		}
	},

	createCompany: async (req, res, next) => {
		const {
			fname,
			lname,
			mobile,
			password,
			email,
			address,
			expireDate,
			companyName,
			role,
		} = req.body;

		const newUser = await new UserModel({
			fname,
			lname,
			mobile,
			password,
			role: 512,
		}).save();
		if (!newUser) {
			return res.status(400).json({ msg: "کاربر ایجاد نشد" });
		}

		const newCompany = await new CompanyModel({
			companyName,
			contacts: [newUser._id],
			owner: [newUser._id],
			expireDate,
			mobile,
		}).save();
		if (!newCompany) {
			return res.status(400).json({ msg: "کسب‌و‌کار ایجاد نشد" });
		}

		return res.status(200).json({
			success: true,
			msg: "کسب‌و‌کار ایجاد شد",
		});
	},

	loginByPassword: async (req, res, next) => {
		try {
			const { mobile, password } = req.body;
			console.log("password is:", password);
			const user = await userModel.findOne({ mobile });
			console.log(user);
			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				return res.status(400).send({
					success: false,
					message: "پسورد یا تلفن همراه اشتباه است",
				});
			}

			if (!user.isActive) {
				return res.status(401).send({
					success: false,
					message: "حساب شما غیرفعال است",
				});
			}

			const company = await companyModel.findById(user.companyId);
			if (company.expireDate >= new Date()) {
				const accesstoken = creatAccessToken({ id: user._id });
				const refreshtoken = createRefreshToken({ id: user._id });

				res.cookie("refreshtoken", refreshtoken, {
					httpOnly: true,
					path: "/api/v1/user/refresh_token",
				});

				res.status(200).send({
					accesstoken,
					success: true,
					message: `${user.fname} ${user.lname} خوش آمدید`,
				});
			} else {
				res.status(400).send({
					success: true,
					message: `اعتبار پنل شما به اتمام رسیده است`,
				});
			}
		} catch (error) {
			next(error);
		}
	},
};

const creatAccessToken = (user) => {
	return jwt.sign(user, process.env.ADMIN_ACCESS_TOKEN_SECRET, {
		expiresIn: "1d",
	});
};

const createRefreshToken = (user) => {
	return jwt.sign(user, process.env.ADMIN_REFRESH_TOKEN_SECRET, {
		expiresIn: "7d",
	});
};

module.exports = AdminControll;

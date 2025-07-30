const userModel = require("../models/userModel");
const companyModel = require("../models/companyModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Kavenegar = require("kavenegar");
const Buffer = require("buffer").Buffer;
const { createCaptcha } = require("nastaliq-captcha");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { from } = require("jalali-moment");

const userControll = {
	register: async (req, res, next) => {
		try {
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
			if (fname === undefined || lname === "") {
				return res.status(422).send({
					error: true,
					message: "اطلاعات ارسالی معتبر نیست",
				});
			}
			// validation
			const uniqueMobile = await userModel.findOne({ mobile });
			if (uniqueMobile) {
				return res.status(400).send({
					message: "شماره تلفن قبلا ثبت شده است",
				});
			}

			const regex =
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
			if (!regex.test(password)) {
				return res.status(400).send({
					message:
						"رمز عبور باید حداقل 8 کاراکتر باشد و شامل حروف کوچک و بزرگ و یک عدد و یک حرف و نکته خاص باشد",
				});
			}

			const passwordHash = await bcrypt.hash(password, 10);

			const newUser = new userModel({
				fname,
				lname,
				mobile,
				password: passwordHash,
				email,
				address,
				role,
			});

			await newUser.save();

			const accesstoken = creatAccessToken({ id: newUser._id });
			const refreshtoken = createRefreshToken({ id: newUser._id });

			res.cookie("refreshtoken", refreshtoken, {
				httpOnly: true,
				path: "/api/v1/user/refresh_token",
			});

			//create company
			const currentDate = new Date(); // Current date and time
			let calculatedExpireDate = new Date(currentDate);
			if (expireDate == "eternal") {
				calculatedExpireDate.setFullYear(currentDate.getFullYear() + 50);
			} else if (expireDate > 6) {
				calculatedExpireDate.setFullYear(currentDate.getFullYear() + 1);
			} else {
				calculatedExpireDate.setMonth(currentDate.getMonth() + expireDate);
			}

			const company = await companyModel.findOne({ mobile });
			if (company) {
				return res
					.status(400)
					.send({ message: "برای این شماره همراه قبلا پنل ایجاد شده است" });
			}

			const newCompany = new companyModel({
				companyName,
				mobile,
				expireDate,
				owner: newUser._id,
				expireDate: calculatedExpireDate,
			});

			newCompany.contacts.push(newUser._id);

			await newCompany.save();

			//update created user
			const createdUser = await userModel.findOne({ _id: newUser._id });
			createdUser.companyId = newCompany._id;

			await createdUser.save();

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

	registerAsuperAdmin: async (req, res, next) => {
		try {
			const { fname, lname, mobile, password, email, role, isAdmin } = req.body;

			const passwordHash = await bcrypt.hash(password, 10);
			const newUser = new userModel({
				fname,
				lname,
				mobile,
				password: passwordHash,
				email,
				address,
				role,
				isAdmin,
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

	smsVerify: async (req, res, next) => {
		try {
			const { mobile, password } = req.body;
			const user = await userModel.findOne({ mobile });
			if (!user) {
				return res.status(400).send({
					message: "کاربر وجود ندارد",
				});
			}

			const randomNumbers = generateRandomNumbers();
			console.log("randomNumbers", randomNumbers);
			user.verifyCode = randomNumbers;
			await user.save();

			const api = Kavenegar.KavenegarApi({
				apikey:
					"346D356E73524950756D7467387635312B58396737524F482F7643683546743139427668596330474730593D",
			});
			api.VerifyLookup(
				{
					receptor: mobile,
					token: randomNumbers,
					template: "registerverify",
				},
				function (response, status) {
					console.log(response);
					console.log(status);
				}
			);

			res.status(200).send({
				success: true,
				message: "پیامک ارسال شد",
			});
		} catch (error) {
			next(error);
		}
	},

	login: async (req, res, next) => {
		try {
			const { mobile, code } = req.body;
			const user = await userModel.findOne({ mobile });

			// const isMatch = await bcrypt.compare(password, user.password);
			// if (!isMatch) {
			//   return res.status(400).send({
			//     message: "پسورد اشتباه است",
			//   });
			// }
			if (user.verifyCode != code) {
				res.status(400).send({
					success: false,
					message: "کد وارد شده اشتباه است",
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

	logout: async (req, res, next) => {
		try {
			res.clearCookie("refreshtoken", {
				path: "/api/v1/user/refresh_token",
			});

			// res.clearStorage('firstLogin')

			return res.status(201).send({
				message: "با موفقیت از سیستم خارج شدید",
			});
		} catch (error) {
			next(error);
		}
	},

	refreshtoken: (req, res, next) => {
		try {
			const rf_token = req.cookies.refreshtoken;
			console.log("rf-token", rf_token);

			jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
				if (err) {
					return res.status(400).send({
						success: false,
						message: "لطفا وارد حساب کاربری شوید یا ثبت نام کنید",
					});
				}
				const accesstoken = creatAccessToken({ id: user.id });
				res.status(201).send({ success: true, accesstoken });
			});
		} catch (error) {
			next(error);
		}
	},

	getUser: async (req, res, next) => {
		try {
			const user = await userModel.findById(req.user.id).select("-password");
			if (!user) {
				return res.status(401).send({
					message: "کاربر وجود ندارد",
				});
			}
			res.send(user);
		} catch (error) {
			next(error);
		}
	},

	addCollegue: async (req, res, next) => {
		try {
			const {
				fname,
				lname,
				mobile,
				password,
				email,
				address,
				expireDate,
				companyName,
				companyId,
				createdById,
			} = req.body;

			const user = await userModel.findById(createdById);
			if (user.role < 512) {
				return res.status(401).send({
					success: false,
					message: "دسترسی افزودن همکار ندارید",
				});
			}

			const passwordHash = await bcrypt.hash(password, 10);

			const newCollegue = new userModel({
				fname,
				lname,
				mobile,
				email,
				address,
				companyId,
				password: passwordHash,
				role: 256,
			});

			await newCollegue.save();

			const company = await companyModel.findById(companyId);
			company.contacts.push(newCollegue._id);
			await company.save();

			res.status(200).send({
				success: true,
				message: "همکار جدید اضافه شد",
			});
		} catch (error) {
			next(error);
		}
	},

	getCollegues: async (req, res, next) => {
		try {
			const { companyId } = req.params;
			const users = await userModel.find({ companyId: companyId });
			res.status(200).send({
				success: true,
				items: users,
			});
		} catch (error) {
			next(error);
		}
	},

	deactiveCollegue: async (req, res, next) => {
		const { userId, status } = req.body;
		const { collegueId } = req.params;
		const admin = await userModel.findById(userId);
		if (admin.role != 512) {
			return res.status(400).send({
				success: false,
				message: "دسترسی حذف همکار ندارید",
			});
		}

		if (collegueId == userId) {
			return res.status(400).send({
				success: false,
				message: "شما ادمین هستید",
			});
		}

		const collegue = await userModel.findById(collegueId);
		collegue.isActive = status;
		await collegue.save();

		const meesageText = status
			? `${collegue.fname} ${collegue.lname} فعال شد.`
			: `${collegue.fname} ${collegue.lname} غیر فعال شد.`;

		res.status(200).send({
			success: true,
			message: meesageText,
		});
	},

	getCompany: async (req, res, next) => {
		try {
			const { companyId } = req.params;

			const company = await companyModel.findById(companyId);

			res.status(200).send({
				success: true,
				company,
				message: "همکار جدید اضافه شد",
			});
		} catch (error) {
			next(error);
		}
	},

	addcart: async (req, res, next) => {
		try {
			const user = await userModel.findById(req.user.id);
			if (!user) {
				return res.status(400).send({
					message: "کاربر وجود ندارد",
				});
			}
			const cart = req.body.cart;
			res.status(200).send({
				status: "success",
				message: "با موفقیت به سبد خرید اضافه شد",
				cart,
			});

			await userModel.findOneAndUpdate({ _id: req.user.id }, { cart: cart });
		} catch (error) {
			next(error);
		}
	},

	editInfo: async (req, res, next) => {
		try {
			const user = await userModel.findById(req.params.id);
			if (!user) {
				return res.status(400).send({
					message: "کاربر وجود ندارد",
				});
			}
			const { fname, lname, address, mobile, email } = req.body;
			await userModel.findOneAndUpdate(
				{ _id: req.params.id },
				{ fname, lname, address, mobile, email }
			);
			res.status(200).send({
				status: "success",
				message: "با موفقیت ویرایش شد",
			});
		} catch (error) {
			next(error);
		}
	},

	createCaptcha: async (req, res, next) => {
		const captcha = createCaptcha({
			width: 150,
			height: 50,
			from: 100,
			to: 999,
			lines: 3,
		});
		const number = captcha.number; // You can store it in a session and compare with user answer
		const image = new Buffer(captcha.image, "base64");

		res.clearCookie("captcha", { path: "/" });

		res.cookie("captcha", number, {
			path: "/",
		});

		res.end(image);
	},

	forgetPassword: async (req, res, next) => {
		try {
			const { email } = req.body;
			const user = await userModel.findOne({ email });
			if (!user) {
				return res
					.status(404)
					.json({ message: "کاربری با این ایمیل ثبت نشده" });
			}

			// Generate a unique token
			const token = crypto.randomBytes(20).toString("hex");
			user.resetPasswordToken = token;
			user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

			// Save user with token
			await user.save();

			const transporter = nodemailer.createTransport({
				// service: 'Gmail',
				host: "smtp.gmail.com",
				port: 465,
				auth: {
					user: "alirza.mehrzad@gmail.com",
					pass: "bziwdrruhxkribcc",
					// pass: 'bziwdrruhxkribcc'
				},
			});

			const sendResetEmail = (email, token) => {
				const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
				const mailOption = {
					to: email,
					from: "alirza.mehrzad@gmail.com",
					subject: "ایمیل لینک بازیابی",
					text: resetUrl,
				};
				return transporter.sendMail(mailOption);
			};
			sendResetEmail(email, token);

			// // Send email with reset link
			// const transporter = nodemailer.createTransport({
			//   // Configure your email service here
			// });
			// const mailOptions = {
			//   from: 'alirza.mehrzad@email.com',
			//   to: user.email,
			//   subject: 'Password Reset',
			//   text: `Click this link to reset your password: ${process.env.CLIENT_URL}/reset-password/${token}`,
			// };
			// await transporter.sendMail(mailOptions);

			res.status(200).json({ message: "ایمیل بازیابی ارسال شد" });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error" });
		}
	},
};

const creatAccessToken = (user) => {
	return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};

const createRefreshToken = (user) => {
	return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

function generateRandomNumbers() {
	const min = 10000; // Smallest 5-digit number
	const max = 99999; // Largest 5-digit number

	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sendResetEmail(email, token) {}

module.exports = userControll;

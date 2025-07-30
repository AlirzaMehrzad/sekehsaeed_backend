// validations/superAdminValidation.joi.js
const Joi = require("joi");

// Joi schema
const createSuperAdminSchema = Joi.object({
	email: Joi.string().email().required().messages({
		"string.empty": "ایمیل اجباری است",
		"string.email": "ایمیل نامعتبر",
	}),
	fname: Joi.string().required().messages({
		"string.empty": "نام اجباری",
	}),
	lname: Joi.string().required().messages({
		"string.empty": "نام خانوادگی اجباری",
	}),
	mobile: Joi.string().required().messages({
		"string.empty": "تلفن اجباری",
	}),
	password: Joi.string()
		.min(8)
		.pattern(
			new RegExp(
				"^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}\\[\\]:;\"'<>,.?/~`]).+$"
			)
		)
		.required()
		.messages({
			"string.empty": "رمز عبور اجباری است",
			"string.min": "رمز عبور باید حداقل 8 کاراکتر باشد",
			"string.pattern.base":
				"رمز عبور باید شامل حروف کوچک و بزرگ و یک عدد و یک حرف خاص باشد",
		}),
	// role: Joi.number().required().messages({
	// 	"number.base": "رول باید عدد باشد",
	// 	"any.required": "رول اجباری است",
	// }),
}).unknown(false); // ❌ Reject unexpected fields

// Validation middleware
const createSuperAdminValidation = (req, res, next) => {
	const { error } = createSuperAdminSchema.validate(req.body, {
		abortEarly: false, // collect all errors
	});

	if (error) {
		return res.status(400).json({
			errors: error.details.map((err) => ({
				msg: err.message,
				param: err.context.key,
			})),
		});
	}

	next();
};

module.exports = {
	createSuperAdminValidation,
};

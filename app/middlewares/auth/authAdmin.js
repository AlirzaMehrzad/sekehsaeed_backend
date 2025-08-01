const userModel = require("../../models/userModel");

const authAdmin = async (req, res, next) => {
	try {
		const user = await userModel.findOne({
			_id: req.user.id,
		});
		if (!user)
			return { success: false, message: "کاربری با این تلفن ثبت نشده" };

		if (user.role !== 1024) {
			return res.status(400).send({
				message: "دسترسی به ادمین رد شد",
			});
		}

		next();
	} catch (error) {
		return res.status(500).send({ message: error.message });
	}
};

module.exports = authAdmin;

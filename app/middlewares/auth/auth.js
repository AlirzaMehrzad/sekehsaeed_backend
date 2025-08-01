const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
	try {
		const token = req.header("Authorization");
		if (!token) {
			return res.status(401).send({
				message: "aaشما صلاحیت استفاده از این قسمت را ندارید",
			});
		}

		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
			if (err) {
				return res.status(400).send({
					message: "شما صلاحیت استفاده از این قسمت را ندارید",
				});
			}

			req.user = user;
			next();
		});
	} catch (error) {
		return res.status(500).json({ msg: err.message });
	}
};

module.exports = auth;

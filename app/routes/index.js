const userRouter = require("./userRouter");
const uploadRouter = require("./uploadRouter");
const companyRouter = require("./companyRouter");
const transferRouter = require("./transferRouter");
const adminRouter = require("./adminRouter");

module.exports = (app) => {
	app.use("/api/v1/user", userRouter);
	app.use("/api/v1/upload", uploadRouter);
	app.use("/api/v1/company", companyRouter);
	app.use("/api/v1/transfer", transferRouter);
	app.use("/api/v1/adminDashboard", adminRouter);
};

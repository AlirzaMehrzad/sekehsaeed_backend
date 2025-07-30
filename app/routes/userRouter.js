const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth/auth");
const {
	createSuperAdminValidation,
} = require("../middlewares/validators/createSuperAdminValidation");
const usersControllers = require("../controllers/usersControllers");

router.post("/register", usersControllers.register);
router.post("/add_collegue", auth, usersControllers.addCollegue);
router.get("/collegues/:companyId", auth, usersControllers.getCollegues);
router.patch(
	"/deactiveCollegue/:collegueId",
	auth,
	usersControllers.deactiveCollegue
);
router.get("/get_company/:companyId", auth, usersControllers.getCompany);

// router.post("/login", usersControllers.login);
router.post("/login", usersControllers.loginByPassword);

router.post("/loginVerify", usersControllers.smsVerify);

router.get("/logout", usersControllers.logout);

router.get("/refresh_token", usersControllers.refreshtoken);

router.get("/infor", auth, usersControllers.getUser);

router.get("/captcha", usersControllers.createCaptcha);

router.post("/forget-password", usersControllers.forgetPassword);

module.exports = router;

const express = require("express");
const router = express.Router();
const authAdmin = require("../middlewares/auth/authAdmin");
const adminController = require("../controllers/adminController");
const {
	createSuperAdminValidation,
} = require("../middlewares/validators/createSuperAdminValidation");

router.post(
	"/registerAdmin/isSuperAdmin",
	createSuperAdminValidation,
	adminController.registerAdmin
);

router.post("/createCompany", authAdmin);

// TODO
router.post("/getCompanies");
router.post("/getUsers");

module.exports = router;

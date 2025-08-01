const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth/auth");
const {
	createSuperAdminValidation,
} = require("../middlewares/validators/createSuperAdminValidation");
const usersControllers = require("../controllers/usersControllers");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *               - fname
 *               - lname
 *               - expireDate
 *               - companyName
 *             properties:
 *               mobile:
 *                 type: string
 *                 example: "09360657702"
 *               fname:
 *                 type: string
 *                 example: "نوشین"
 *               lname:
 *                 type: string
 *                 example: "سبزیوند"
 *               expireDate:
 *                 type: integer
 *                 example: 12
 *               companyName:
 *                 type: string
 *                 example: "َشرکت مامان"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid request body
 */

router.post("/register", usersControllers.register);

/**
 * @swagger
 * /api/v1/user/collegues/{companyId}:
 *   post:
 *     summary: Get collegues by company
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of collegues
 */
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

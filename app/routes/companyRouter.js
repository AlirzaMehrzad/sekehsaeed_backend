const router = require("express").Router();
const companyControll = require("../controllers/companyController");
// const auth = require("../middlewares/auth/auth");
const authAdmin = require("../middlewares/auth/authAdmin");
const auth = require("../middlewares/auth/auth");

router
	.route("/")
	// .get(categoryControll.getCategories)
	// .post(auth, authAdmin, companyControll.createCompany)
	.post(auth, authAdmin, companyControll.createCompany);

router.route("/:id");
// .delete(auth, authAdmin, categoryControll.deleteCategory)
// .put(auth, authAdmin, categoryControll.updateCategory)

module.exports = router;

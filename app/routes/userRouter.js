const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const usersControllers = require("../controllers/usersControllers");

router.post("/register", usersControllers.register);

router.post("/login", usersControllers.login);

router.get("/logout", usersControllers.logout);

router.get("/refresh_token", usersControllers.refreshtoken);

router.get("/infor", auth, usersControllers.getUser);

router.patch("/addcart", auth, usersControllers.addcart);

router.patch("/:id/edit_info", usersControllers.editInfo);

module.exports = router;

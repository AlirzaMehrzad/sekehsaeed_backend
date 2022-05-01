const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const sliderControllers = require("../controllers/sliderControllers");

router
  .route("/")
  .post(sliderControllers.newPicture)
  .get(sliderControllers.getPicture);

router.route("/:id").delete(sliderControllers.deletePicture);

module.exports = router;

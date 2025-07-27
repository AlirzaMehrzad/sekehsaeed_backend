const sliderModel = require("../models/fileModel");

const sliderControllers = {
  newPicture: (req, res, next) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).send({
          status: "fail",
          message: "لطفا همه فیلد ها را پر کنید",
        });
      }

      const newPicture = new sliderModel({
        image,
      });
      newPicture.save().then((result) => {
        res.status(201).send({
          status: "success",
          message: "عکس با موفقیت ثبت شد",
          result,
        });
      });
    } catch (error) {
      next(error);
    }
  },

  getPicture: (req, res, next) => {
    try {
      sliderModel.find().then((pictures) => {
        res.status(200).send({
          status: "success",
          pictures,
        });
      });
    } catch (error) {
      next(error);
    }
  },

  deletePicture: (req, res, next) => {
    try {
      const { id } = req.params;
      sliderModel.findByIdAndDelete(id).then((result) => {
        res.status(200).send({
          status: "success",
          message: "عکس با موفقیت حذف شد",
          result,
        });
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = sliderControllers;

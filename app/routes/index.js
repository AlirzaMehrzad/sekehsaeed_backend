const userRouter = require("./userRouter");
const categoryRouter = require("./categoryRouter");
const uploadRouter = require("./uploadRouter");
const productRouter = require("./productRouter");
const paymentRouter = require("./paymentRouter");
const sliderRouter = require("./sliderRouter");
const companyRouter = require("./companyRouter");
const transferRouter = require("./transferRouter");

module.exports = (app) => {
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/category", categoryRouter);
  app.use("/api/v1/upload", uploadRouter);
  app.use("/api/v1/products", productRouter);
  app.use("/api/v1/payment", paymentRouter);
  app.use("/api/v1/slider", sliderRouter);
  app.use("/api/v1/company", companyRouter);
  app.use("/api/v1/transfer", transferRouter);
};

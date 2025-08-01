const express = require("express");
const swaggerSpec = require("../swagger");
const swaggerUi = require("swagger-ui-express");
const app = express();

app.use("/uploads", express.static("uploads"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

require("./boot");
require("./middlewares")(app);
require("./routes")(app);

module.exports = app;

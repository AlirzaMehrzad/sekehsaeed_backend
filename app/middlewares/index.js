const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const session = require('express-session');


module.exports = (app) => {
  app.use(express.json());
  app.use(cookieParser());
  app.use(session({
    secret: 'asrgklujhanervh9854hhnuafhnvg3489hfbn@@@##%^%$6rfg', // Change this to a secure secret
    resave: false,
    saveUninitialized: true,
  }));
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(bodyParser.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    fileUpload({
      useTempFiles: true,
    })
  );
};

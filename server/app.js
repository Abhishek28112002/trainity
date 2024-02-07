const express = require("express");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const cookieParser = require("cookie-parser");
const moment = require("moment");

const connectDB = require("./config/db");

process.env.TZ = "Asia/Kolkata";

require("./models/Rewards");

connectDB();

const app = express();

app.use(cookieParser());
app.use(express.json());

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Sessions
app.use(
  session({
    secret: "session-verification-key",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
    }),
    cookie: {
      maxAge: 10 * 12 * 60 * 60 * 1000, // 5 days
    },
  })
);

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

const port = process.env.PORT || 3000;

app.use("/", require("./routes/rewards"));

app.listen(port, () => {
  console.log(
    `Server runnning in ${process.env.NODE_ENV} mode on port ${port}`
  );
});

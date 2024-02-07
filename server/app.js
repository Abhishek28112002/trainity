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
//DB
const connectDB = require("./config/db");

process.env.TZ = "Asia/Kolkata";

require("./models/Admin");
require("./models/AuthorizedAdmin");
require("./models/Performance/TeamTables");
require("./models/Performance/PerformanceRecord");
require("./models/Performance/DailyTask");
require("./models/Performance/Level");
require("./models/Performance/RatingReview");
require("./models/PerformanceScore");
require("./models/Performance/PIndicatorComment");
require("./models/Performance/PIndicatorNudge");
require("./models/Project/Comapny")
require("./models/Project/MilestoneProject")
require("./models/Project/MilestoneTask")
require("./models/Project/Objectives")
require("./models/Project/KeyResult")
require("./models/Project/SubKeyResult")
require("./models/Project/StrategicPillars")
require("./models/Project/TaskSubmission")

require("./models/Project/Initiatives")
require("./models/Project/subTask")
require("./models/Project/TableHeader")
require("./models/Learning/Course");
require("./models/Learning/Track");
require("./models/Learning/Module");
require("./models/Learning/Lesson");
require("./models/Learning/Quiz");
require("./models/Learning/Question");
require("./models/Learning/Instructor");
require("./models/Learning/Project");
require("./models/Learning/LiveSession");
require("./models/Learning/TeachingAssistant");
require("./models/Learning/ProjectSubmission");
require("./models/Leaves");
require("./models/Rewards");
require("./models/Performance/IssueonLeave");
require("./models/Salary");
require("./models/BadgesLog");

require("./models/Bonus/BonusInfo");
require("./models/Bonus/ESOPInfo");
require("./models/Bonus/ESOPConfig");

//Passport Config
require("./config/passport")(passport);

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

app.set("view engine", "ejs");

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

//Static Folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/", require("./routes/index"));
app.use("/", require("./routes/Adminprojects"));
app.use("/", require("./routes/performanceBoard"));
app.use("/learning", require("./routes/learning"));
app.use("/", require("./routes/project"));
app.use("/aws", require("./routes/upload"));
app.use("/", require("./routes/rewards"));
app.use("/", require("./routes/leavesAccountability"));
app.use("/", require("./routes/SalaryWithdrawal"));

app.use("/", require("./routes/pBonus"));
//404
app.get("/*", (req, res) => {
  res.render("error-404");
});

app.listen(port, () => {
  console.log(
    `Server runnning in ${process.env.NODE_ENV} mode on port ${port}`
  );
});



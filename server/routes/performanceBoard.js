const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const axios = require("axios");
const {
  ensureGuest,
  ensureAuth,
  ensureManager,
} = require("../middleware/auth");
const XLSX = require("xlsx");
const jsontoxml = require("jsontoxml");
const Admin = mongoose.model("admins");
const PerformanceRecord = mongoose.model("performanceRecords");
const DailyTask = mongoose.model("dailyTasks");
const Level = mongoose.model("levels");
const Projects = mongoose.model("milestoneProjects");
const moment = require("moment");
const Tasks = mongoose.model("milestoneTasks");
const Sheets = require("./google_sheet");
const RatingReview = mongoose.model("ratingReview");
const LeaveIssue = mongoose.model("leaveissue");
const Leaves = mongoose.model("leave");
const BadgesLog = mongoose.model("badgesLog");
const TeamTable = mongoose.model("TeamTable");
const SubTask = mongoose.model("milestoneSubTask");
const KR = mongoose.model("milestoneKR");
const TableHeader = require("../models/Project/TableHeader");
const TaskSubmission = mongoose.model("TaskSubmission");
const ESOPConfig = mongoose.model("esopConfigs");
const ESOPInfo = mongoose.model("esopInfos");
const BonusInfo = mongoose.model("bonusInfos");
const PIndicatorComment = mongoose.model("pIndicatorComment");
const Nudge = mongoose.model("pIndicatorNudge");
const PerformanceScoreModal= mongoose.model("PerformanceScore")
router.get("/get/feedback/nudge/:employeeId", ensureAuth, async (req, res) => {
  try {
    let employeeId = req.params.employeeId;
    let feedbacks = await PIndicatorComment.find({ employeeId });
  
    let nudges = await Nudge.find({ employeeId });
    res.status(200).send({ feedbacks, nudges });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "something went wrong" });
  }
});

router.post(
  "/performanceBoard/feedback",
  ensureAuth,
  ensureManager,
  async (req, res) => {
    try {
      let feedback = await PIndicatorComment.create(req.body);
      res.status(200).send({ feedback });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "something went wrong" });
    }
  }
);

async function fiii()
{
// let comments=await PIndicatorComment.find({});
// console.log(comments)
// let nudges=await Nudge.find({});
// console.log(nudges)
//await BadgesLog.deleteMany({employeeId:'64e72baf9f92934f548f1cd9'})
let admin=await Admin.find({});
for(let ad of admin)
{
 if(!ad.performanceTypeForFutureMonths)
 {
  ad.performanceTypeForFutureMonths=false;
  await ad.save()
 }
}
}
//fiii()
router.delete(
  "/performanceBoard/feedback",
  ensureAuth,
  ensureManager,
  async (req, res) => {
    try {
      const { feedbackId } = req.body;
      console.log(feedbackId);
      await PIndicatorComment.findByIdAndDelete(feedbackId);
      res
        .status(200)
        .send({ message: "Feedback deleted successfully", success: true });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "something went wrong" });
    }
  }
);
var performanceMap = new Map();

async function f() {
  let performance = await RatingReview.find({});
  for (let record of performance) {
    try {
      // record.dateIST=new Date(record.date);
      // await record.save();
      //console.log(record.date,"new Date",record.dateIST.getFullYear(),record.dateIST.getMonth(),record.dateIST.getDate())
    } catch (error) {
      console.log(error);
    }
  }
}
//f();

function commafy(num) {
  if (isNaN(num)) return "";
  var x = num.toString();
  var afterPoint = "";
  if (x.indexOf(".") > 0) afterPoint = x.substring(x.indexOf("."), x.length);
  x = Math.floor(x);
  x = x.toString();
  var lastThree = x.substring(x.length - 3);
  var otherNumbers = x.substring(0, x.length - 3);
  if (otherNumbers != "") lastThree = "," + lastThree;
  var res =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
  return res;
}

router.post("/create/team", ensureAuth, ensureManager, async (req, res) => {
  try {
    let title = req.body.teamName;

    let team = await TeamTable.findOne({ title });
    if (team) {
      await TeamTable.findOneAndUpdate({ title }, req.body);
    } else {
      let teams = await TeamTable.find({});
      req.body.srNo = teams.length;
      req.body.title = req.body.teamName;
      team = await TeamTable.create(req.body);
    }
    res.status(200).send({ message: "added" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "something went wrong" });
  }
});
router.delete("/create/team", ensureAuth, ensureManager, async (req, res) => {
  try {
    let title = req.body.teamName;
    let team = await TeamTable.findOneAndDelete({ title });
    res.status(200).send({ message: "added" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "something went wrong" });
  }
});
router.post(
  "/update/teamOrder",
  ensureAuth,
  ensureManager,
  async (req, res) => {
    try {
      let teams = req.body.teams;

      for (let i = 0; i < teams.length; i++) {
        let team = await TeamTable.findOneAndUpdate(
          { title: teams[i] },
          { srNo: i }
        );
      }
      res.status(200).send({ message: "updated" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "something went wrong" });
    }
  }
);
router.post("/replace/teams", ensureAuth, ensureManager, async (req, res) => {
  try {
    let { old_team, new_team } = req.body;
    let team = await TeamTable.findOne({ title: old_team });
    team.title = new_team;
    await team.save();
    res.status(200).send({ message: "updated" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "something went wrong" });
  }
});

router.get("/performanceBoardemployee/:date", ensureAuth, async (req, res) => {
  try {
    const user = req.user;
    const date = req.params.date;
    res.locals.managerVisitingId = "performanceBoardemployee" + user._id;
    res.locals.managerVisiting = false;
    res.locals.managerVisitingInfo=user;
    if (user.managerID.length == 0) {
      res.locals.manager = user;
    } else {
      let manager = user;
      if (user.managerID.length == 0) manager = user;
      else {
        let managerId = user.managerID[0];
        if (managerId != "") manager = await Admin.findById(managerId);
        if (!manager) manager = user;
      }
      res.locals.manager = manager;
    }

    res.locals.leaveAnncouncement = user.leave_announcement;
    user.leave_announcement = false;
    await user.save();
    await SortProjectsTasks(user._id, res, date);
    await SetPerformances(user._id, date, true, res, false);
    await SetPBonus(user._id, res);

    res.render("performance-board");
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "something went wrong" });
  }
});

router.post("/create/nudge", ensureAuth, ensureManager, async (req, res) => {
  try {
    let nudge = await Nudge.findOne({
      type: req.body.type,
      employeeId: req.body.employeeId,
    });

    if (nudge) {
      nudge.title = req.body.title;
      nudge.description = req.body.description;
      nudge.createdAt = new Date(); // Corrected the property name to createdAt
      await nudge.save();
    } else {
      nudge = await Nudge.create(req.body);
    }

    res.status(200).send({ nudge });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});

router.delete("/create/nudge", ensureAuth, ensureManager, async (req, res) => {
  try {
    let nudge = await Nudge.findByIdAndDelete(req.body.nudgeId);
    res.status(200).send({ message: "deleted", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});
router.get(
  "/fetch/recordbydate/:date/:employeeID",
  ensureAuth,
  async (req, res) => {
    try {
      const date = req.params.date;

      let employeeID = req.params.employeeID;
      let performanceRecord = await PerformanceRecord.findOne({
        date,
        employeeID: employeeID,
      });
      if (!performanceRecord) {
        performanceRecord = await PerformanceRecord.create({
          date: date,
          employeeID: employeeID,
          taskStatus: [false],
        });
      }
      res.status(200).send({ performanceRecord });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        error: "Something went wrong",
      });
    }
  }
);

async function GetEmployeeListofPerformance(date) {
  try {
    let teams = await TeamTable.find({});
    teams.sort((a, b) => {
      return a.srNo - b.srNo;
    });
    const teamMembers = {};
    let adminPerformanceList = {}; // Use "let" instead of "const" to allow reassignment

    const employeeList = await Admin.find({});

    await Promise.all(
      employeeList.map(async (admin) => {
        let performanceRecord = await PerformanceRecord.findOne({
          employeeID: admin.id,
          date,
        });
        let taskStatus = [];
        if (performanceRecord) {
          taskStatus = performanceRecord.taskStatus;
        }

        // Add the admin to the performance list using admin._id as the key
        adminPerformanceList[admin._id.toString()] = {
          admin: admin,
          taskStatus: taskStatus,
        };
      })
    );

    // Convert the object to an array of objects
    const adminPerformanceArray = Object.keys(adminPerformanceList).map(
      (adminId) => ({
        id: adminId,
        admin: adminPerformanceList[adminId].admin,
        taskStatus: adminPerformanceList[adminId].taskStatus,
      })
    );

    adminPerformanceArray.sort((a, b) => {
      // Compare based on taskStatus
      const aTaskStatus = a.taskStatus; // Access "taskStatus" from the "admin" object
      const bTaskStatus = b.taskStatus;

      for (let i = 0; i < 4; i++) {
        const aStatus = Boolean(aTaskStatus[i]);
        const bStatus = Boolean(bTaskStatus[i]);

        if (aStatus && !bStatus) {
          return -1;
        } else if (!aStatus && bStatus) {
          return 1;
        }
      }
    });

    const employeePositions = new Map();

    adminPerformanceArray.forEach((employee, index) => {
      // Store the index of the employee in the array
      employeePositions.set(employee.admin._id.toString(), index);
    });

    // Sort teamMembers[teamNames] based on the positions in adminPerformanceArray
    teams.map((team) => {
      let teamName = team.title;
      teamMembers[teamName] = team.employees;
    });

    // Convert the sorted array back to the desired format
    adminPerformanceList = adminPerformanceArray.reduce((acc, admin) => {
      let dumy = {};
      for (let key in admin) {
        dumy[key] = admin[key];
      }
      dumy.taskStatus = admin.taskStatus;
      acc[admin.id] = dumy; // Assign the "admin" object
      return acc;
    }, {});

    return { adminPerformanceList, teamMembers };
  } catch (error) {
    console.log(error);
    return { adminPerformanceList: {}, teamMembers: {} };
  }
}

router.get("/performanceBoard", ensureAuth, ensureManager, async (req, res) => {
  try {
    let employeeId = req.query.id;
    let user = req.user;
    res.locals.managerVisitingInfo = user;
    res.locals.managerVisitingId = "performanceBoard" + user._id;
    const date = req.query.date;
    let { adminPerformanceList, teamMembers } =
      await GetEmployeeListofPerformance(date);

    let current_tab_exist = false;
    let currentTab = req.query.currentTab;
  
    for (let teamName in teamMembers) {
      if (teamName == currentTab) current_tab_exist = true;
      if (currentTab == undefined) currentTab = teamName;
      if (!employeeId) {
        employeeId = teamMembers[teamName][0];
      }
    }

    if (!current_tab_exist && currentTab !='All') {
      for (let teamName in teamMembers) {
        currentTab = teamName;
        break;
      }
    }
    const employee = await Admin.findById(employeeId);
   if(!employee)
   {
    res.status(200).send({message:"Employee Not found"})
    return;
   }
    res.locals.currentTab = currentTab;
    res.locals.adminPerformanceList = adminPerformanceList;
    res.locals.teamList = teamMembers;
    res.locals.managerVisiting = true;
    if (employee.managerID.length == 0) {
      res.locals.manager = employee;
    } else {
      let manager = employee;
      if (employee.managerID.length == 0) manager = employee;
      else {
        let managerId = employee.managerID[0];

        if (managerId != "") manager = await Admin.findById(managerId);
        if (!manager) manager = employee;
      }
      res.locals.manager = manager;
    }

    if (!employee.usedBadges) {
      employee.usedBadges = 0;
      await employee.save();
    }

    await SortProjectsTasks(employee._id, res, date);
    await SetPerformances(employee._id, date, false, res, true);
    await SetPBonus(employee._id, res);

    res.render("view-performance");
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "something went wrong" });
  }
});

router.get("/add/badges", ensureAuth, async (req, res) => {
  try {
    const employeeList = await Admin.find({ managerID: req.user._id });
    res.locals.employeeList = employeeList;
    res.render("add-badges");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/raiseIssueOnLeave", ensureAuth, async (req, res) => {
  try {
    let leaveissue = await LeaveIssue.create(req.body);
    res.status(200).send({ message: "Issue raised successfully" });
  } catch (error) {
    console.log(error);
  }
});
router.delete("/raiseIssueOnLeave/:id", ensureAuth, async (req, res) => {
  try {
    let leaveissue = await LeaveIssue.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: "Issue deleted successfully" });
  } catch (error) {
    console.log(error);
  }
});
router.patch("/add/badges", ensureAuth, async (req, res) => {
  try {
    const employeeID = req.body.employeeID;
    const badges = Number(req.body.badges);
    const employee = await Admin.findById(employeeID);
    employee.badges += badges;
    await employee.save();
    res.status(200).send(employee);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Something went wrong" });
  }
});

router.get("/mark/performance", ensureAuth, async (req, res) => {
  try {
    const employeeList = await Admin.find({ managerID: req.user._id });
    res.locals.employeeList = employeeList;
    res.render("mark-performance");
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Something went wrong" });
  }
});

router.post(
  "/mark/performance",
  ensureAuth,
  ensureManager,
  async (req, res) => {
    try {
      let {
        rating,
        badges,
        leaveType,
        employeeID,
        date,
        ratingList,
        feedback,
        onleave,
        unratable,
      } = req.body;

      let badgelog = await BadgesLog.findOne({
        employeeId: employeeID,
        date,
        title: "Daily Loom",
      });
      if (badges) badges = Number(badges);
      if (badgelog) {
        badgelog.badges = badges;
        await badgelog.save();
      } else if (badges > 0) {
        let badgelog = await BadgesLog.create({
          employeeId: employeeID,
          date,
          badges,
          allotedDate:new Date()
        });
      }
      let employee = await Admin.findById(employeeID);
      let performanceRecord = await PerformanceRecord.findOne({
        date,
        employeeID,
      });

      if (!performanceRecord) {
        performanceRecord = await PerformanceRecord.create({
          employeeID,
          date,
          rating,
          taskStatus: [false],
        });
      }

      if (performanceRecord.rating === 0) {
        if (Number(rating) != 0) employee.rating.cnt++;
        employee.rating.value += Number(rating);
        employee.markModified("rating");
      } else {
        employee.rating.value += Number(rating) - performanceRecord.rating;
        employee.markModified("rating");
      }
      if (!performanceRecord.onleave && onleave) {
        let leavetype;
        if (leaveType == "Paid") {
          leavetype = { type: "paid", day: 1 };
          employee.leaves.paid.used = Math.min(
            employee.leaves.paid.total,
            employee.leaves.paid.used + 1
          );
        } else {
          leavetype = { type: "unpaid", day: 1 };
          employee.leaves.unpaid.used = Math.min(
            employee.leaves.unpaid.total,
            employee.leaves.unpaid.used + 1
          );
        }
        let leave = await Leaves.create({
          dates: `${date} - ${date}`,
          employeeId: employee._id,
          durationType: "Short Leave",
          totalDayLeaves: 1,
          leaveType: leavetype,
          status: "Accepted",
          takenByEmployee: false,
        });
        performanceRecord.onleave = true;
        performanceRecord.leaveType = leaveType;
      } else if (performanceRecord.onleave && !onleave) {
        let leave = await Leaves.findOne({
          dates: `${date} - ${date}`,
          employeeId: employee._id,
        });

        if (leave) {
          if (leave.leaveType.type === "paid")
            employee.leaves.paid.used = Math.max(
              0,
              employee.leaves.paid.used - 1
            );
          else
            employee.leaves.unpaid.used = Math.max(
              0,
              employee.leaves.unpaid.used - 1
            );
          await Leaves.findOneAndDelete({
            dates: `${date} - ${date}`,
            employeeId: employee._id,
          });
        }
        performanceRecord.onleave = false;
        performanceRecord.leaveType = "";
      } else if (performanceRecord.onleave && onleave) {
        let leave = await Leaves.findOne({
          dates: `${date} - ${date}`,
          employeeId: employee._id,
        });

        if (leave) {
          if (leave.leaveType.type != leaveType) {
            if (leave.leaveType.type === "paid") {
              employee.leaves.paid.used = Math.max(
                0,
                employee.leaves.paid.used - 1
              );
              employee.leaves.unpaid.used = Math.max(
                0,
                employee.leaves.unpaid.used + 1
              );
            } else {
              employee.leaves.unpaid.used = Math.max(
                0,
                employee.leaves.unpaid.used - 1
              );
              employee.leaves.paid.used = Math.max(
                0,
                employee.leaves.paid.used + 1
              );
            }
          }
        } else {
          let leavetype;
          if (leaveType == "Paid") {
            leavetype = { type: "paid", day: 1 };
            employee.leaves.paid.used = Math.min(
              employee.leaves.paid.total,
              employee.leaves.paid.used + 1
            );
          } else {
            leavetype = { type: "unpaid", day: 1 };
            employee.leaves.unpaid.used = Math.min(
              employee.leaves.unpaid.total,
              employee.leaves.unpaid.used + 1
            );
          }
          let leave = await Leaves.create({
            dates: `${date} - ${date}`,
            employeeId: employee._id,
            durationType: "Short Leave",
            totalDayLeaves: 1,
            leaveType: leavetype,
            status: "Accepted",
            takenByEmployee: false,
          });
        }
        performanceRecord.onleave = true;
        performanceRecord.leaveType = leaveType;
      }

      if (performanceRecord.badges == 0) employee.badges += badges;
      else employee.badges += badges - performanceRecord.badges;
      performanceRecord.badges = badges;
      performanceRecord.rating = Number(rating);
      if (employee.recent.date == "" || employee.recent.date <= date) {
        employee.recent.date = date;
        employee.recent.rating = Number(rating);
        employee.recent.badges = badges;
      }
      if (Number(rating) >= 4.5) {
        let pervday = getpervday(date);
        const pervperformance = await PerformanceRecord.findOne({
          date: pervday,
          employeeID: employee._id,
        });
        if (pervperformance)
          performanceRecord.streakDays = 1 + pervperformance.streakDays;
        else performanceRecord.streakDays = 1;
        let recentbadges = employee.badges;
        if (performanceRecord.streakDays === 23) {
          performanceRecord.badges += 35;
          employee.badges += 35;
          const badgelog = BadgesLog.create({
            employeeId: employeeID,
            date: date,
            badges: 35,
            title: "Streak",
            description: "23 days streak",
            allotedDate:new Date()
          });
        } else if (performanceRecord.streakDays === 15) {
          performanceRecord.badges += 22;
          employee.badges += 22;
          const badgelog = BadgesLog.create({
            employeeId: employeeID,
            date: date,
            badges: 22,
            title: "Streak",
            description: "15 days streak",
            allotedDate:new Date()
          });
        } else if (performanceRecord.streakDays === 10) {
          performanceRecord.badges += 15;
          employee.badges += 15;
          const badgelog = BadgesLog.create({
            employeeId: employeeID,
            date: date,
            badges: 15,
            title: "Streak",
            description: "10 days streak",
            allotedDate:new Date()
          });
        } else if (performanceRecord.streakDays === 5) {
          performanceRecord.badges += 7;
          employee.badges += 7;
          const badgelog = BadgesLog.create({
            employeeId: employeeID,
            date: date,
            badges: 7,
            title: "Streak",
            description: "5 days streak",
            allotedDate:new Date()
          });
        } else if (performanceRecord.streakDays === 3) {
          performanceRecord.badges += 3;
          employee.badges += 3;
          const badgelog = BadgesLog.create({
            employeeId: employeeID,
            date: date,
            badges: 3,
            title: "Streak",
            description: "3 days streak",
            allotedDate:new Date()
          });
        }

        employee.recent.badges += employee.badges - recentbadges;
      } else {
        performanceRecord.streakDays = 0;
        //await  ChangeStreak(date,employee._id);
      }
      performanceRecord.unratable = unratable;
      performanceRecord.feedback = feedback;
      performanceRecord.ratingList = ratingList;
      employee.markModified("recent");
      employee.markModified("leaves");
      await employee.save();
      await performanceRecord.save();
      let yearmonth = moment(date).format("YYYY-MM");
     let x= setPerformanceScore(yearmonth, employee._id);
      res.status(200).send({ message: "Submitted" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "something went wrong" });
    }
  }
);

router.post("/submit/dailytasklink", ensureAuth, async (req, res) => {
  try {
    let { taskno, link, date, keyPoints } = req.body;

    const employee = req.user;
    const employeeID = employee._id;
    let performanceRecord = await PerformanceRecord.findOne({
      date,
      employeeID,
    });

    const currentTimeFormatted = getCurrentTime();
    if (!performanceRecord) {
      performanceRecord = new PerformanceRecord({
        date,
        employeeID,
        links: [],
        taskStatus: [],
        keyPoints,
      });
    }
    performanceRecord.keyPoints = keyPoints;
    performanceRecord.links[taskno] = link;
    performanceRecord.taskStatus[taskno] = true;
    if (performanceRecord.submittedAt)
      performanceRecord.submittedAt[taskno] = currentTimeFormatted;
    else {
      performanceRecord.submittedAt = ["", "", "", ""];
      performanceRecord.submittedAt[taskno] = currentTimeFormatted;
    }
    performanceRecord.markModified("links");
    performanceRecord.markModified("taskStatus");
    performanceRecord.markModified("submittedAt");
    performanceRecord.markModified("keyPoints");
    await performanceRecord.save();

    //testing
    let notificationmessage = "";
    if (taskno == 1) {
      notificationmessage = `${employee.displayName} have just Submitted Morning Loom Video  <${link}|Check it>  `;
    } else if (taskno == 2) {
      notificationmessage = `${employee.displayName} have just Submitted Noon Loom Video  <${link}|Check it>   `;
    } else if (taskno == 3) {
      notificationmessage = `${employee.displayName} have just Submitted EOD Loom Video  <${link}|Check it> `;
    }

    message = {
      unfurl_media: false,
      unfurl_links: true,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: notificationmessage,
          },
        },
      ],
    };

    axios.post(
      "https://hooks.slack.com/services/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",
      message
    );

    //testing
    //const slackResult = await axios.post('https://hooks.slack.com/services/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', message);

    res.status(200).send({ message: "Submitted" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Something went wrong." });
  }
});

router.get(
  "/performanceData/:employeeId/:daterange/:ratingStatus",
  async (req, res) => {
    try {
      const employeeID = req.params.employeeId;

      if (!employeeID) {
        return res.status(400).send({ error: "Employee ID not found." });
      }

      const dates = getWeekdaysInRange(req.params.daterange);

      let filter = { employeeID, date: { $in: dates } };

      if (req.params.ratingStatus === "Not Rated") {
        filter.rating = 0;
      } else if (req.params.ratingStatus === "Rated") {
        filter.rating = { $gt: 0 };
      }

      const performances = await PerformanceRecord.find(filter);

      res.status(200).send({ performances });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Something went wrong." });
    }
  }
);

router.get("/create/dailyTask", ensureAuth, async (req, res) => {
  try {
    const employeeList = await Admin.find({});
    res.locals.employeeList = employeeList;
    res.render("create-daily-task");
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Something went wrong" });
  }
});

router.get("/fetch/dailyTasks", ensureAuth, async (req, res) => {
  try {
    const employeeID = req.query.employeeID;
    const dailyTasks = await DailyTask.find({ employeeID: employeeID });
    res.status(200).send(dailyTasks);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Something went wrong" });
  }
});

router.post("/create/dailyTask", ensureAuth, async (req, res) => {
  try {
    for (var task of req.body.tasks) {
      const dailyTask = await DailyTask.create({
        taskID: Number(task.taskID),
        employeeID: req.body.employeeID,
        description: task.description,
        deadline: task.deadline,
      });
    }
    res.status(200).send({});
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});

router.get(
  "/editdailyTask/:id",
  ensureAuth,
  ensureManager,
  async (req, res) => {
    try {
      const employee = await Admin.findById(req.params.id);
      const dailyTaskList = await DailyTask.find({ employeeID: req.params.id });
      res.locals.employee = employee;
      res.locals.dailyTaskList = dailyTaskList;
      res.render("edit-daily-tasks");
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Something went wrong" });
    }
  }
);

router.delete(
  "/delete/dailyTask",
  ensureAuth,
  ensureManager,
  async (req, res) => {
    try {
      const dailyTaskID = req.body.dailyTaskID;
      await DailyTask.deleteOne({ _id: dailyTaskID });
      res.status(200).send({});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.get("/create/level", ensureAuth, async (req, res) => {
  try {
    const employeeList = await Admin.find({});
    res.locals.employeeList = employeeList;
    res.render("create-levels");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/create/level", ensureAuth, async (req, res) => {
  try {
    for (var empLevel of req.body.levels) {
      const level = await Level.create({
        employeeID: req.body.employeeID,
        title: empLevel.title,
        badges: Number(empLevel.badges),
        description: empLevel.description,
      });
    }
    res.status(200).send({});
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});

router.get("/editlevel/:id", ensureAuth, ensureManager, async (req, res) => {
  try {
    const employee = await Admin.findById(req.params.id);
    const levelList = await Level.find({ employeeID: req.params.id });
    res.locals.employee = employee;
    levelList.sort((a, b) => {
      return a.badges - b.badges;
    });
    res.locals.levelList = levelList;

    res.render("edit-levels");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put(
  "/editlevel/:levelId",
  ensureAuth,
  ensureManager,
  async (req, res) => {
    try {
      const level = await Level.findById(req.params.levelId);
      const { badges, title, description } = req.body;
      level.badges = badges;
      level.title = title;
      level.description = description;
      await level.save();
      res.status(200).send({ level });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        error: "Something went wrong",
      });
    }
  }
);

router.put(
  "/editdailytask/:dailytaskId",
  ensureAuth,
  ensureManager,
  async (req, res) => {
    try {
      const dailytask = await DailyTask.findById(req.params.dailytaskId);
      const { taskId, description, deadline } = req.body;
      dailytask.taskId = taskId;
      dailytask.description = description;
      dailytask.deadline = deadline;
      await dailytask.save();
      res.status(200).send({ dailytask });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        error: "Something went wrong",
      });
    }
  }
);

router.delete("/delete/level", ensureAuth, ensureManager, async (req, res) => {
  try {
    const levelID = req.body.levelID;
    await Level.deleteOne({ _id: levelID });
    res.status(200).send({});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/performance/previousDayPopUp", ensureAuth, async (req, res) => {
  try {
    const { employeeId, date } = req.body;

    // Find the performance record using the employee ID and date
    const performance = await PerformanceRecord.findOne({
      employeeID: employeeId,
      date,
    });
    // Handle the case when performance record is not found
    if (!performance) {
      return res.status(404).json({ message: "Performance record not found" });
    }
    performance.perviousDayPopUp = true;
    await performance.save();

    return res.status(200).json({ message: "Record updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/streakmonth/:month/:id", ensureAuth, async (req, res) => {
  try {
    let month = req.params.month;
    let id = req.params.id;
    let date = `${month}-01`;
    const streakdays = await streakcountdates(date, id, res);

    return res.status(200).send({ streakdays: streakdays });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/reviewRating", ensureAuth, async (req, res) => {
  try {
    let ratingreview = await RatingReview.findOne({
      date: req.body.date,
      employeeId: req.body.employeeId,
    });
    if (!ratingreview) ratingreview = await RatingReview.create(req.body);
    else {
      ratingreview = await RatingReview.findOneAndUpdate(
        { date: req.body.date, employeeId: req.body.employeeId },
        req.body
      );
    }

    return res
      .status(200)
      .json({ message: "rating review created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// async function dl()
// {
//   let ratingreview=await RatingReview.deleteMany({});
//    ratingreview=await RatingReview.find({});
//
// }
// dl();

router.get("/reviewRating/:employeeId/:date", ensureAuth, async (req, res) => {
  try {
    let date = req.params.date;
    let employeeId = req.params.employeeId;
    const ratingreview = await RatingReview.findOne({ date, employeeId });
    const admin = await Admin.findById(employeeId);
    const performanceRecord = await PerformanceRecord.findOne({
      date,
      employeeID: employeeId,
    });

    return res.status(200).json({ admin, performanceRecord, ratingreview });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/reviewRating/:employeeId/:date", ensureAuth, async (req, res) => {
  try {
    let date = req.params.date;
    let employeeId = req.params.employeeId;

    const ratingreview = await RatingReview.findOneAndUpdate(
      { date, employeeId },
      req.body
    );
    return res.status(200).json(ratingreview);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

async function SetPBonus(employeeId, res) {
  try {
    let esopConfig = await ESOPConfig.findOne({});

    if (esopConfig) {
      const esopLastUpdatedDate = moment(esopConfig.updatedOn).format(
        "Do MMM YYYY"
      );
      res.locals.esopLastUpdatedDate = esopLastUpdatedDate;
    }

    let esopInfo = await ESOPInfo.findOne({ employeeId });
    let bonusInfo = await BonusInfo.findOne({ employeeId });
    let admin = await Admin.findById(employeeId);
    res.locals.esopInfo = esopInfo;
    res.locals.esopConfig = esopConfig;
    res.locals.bonusInfo = bonusInfo;

    const today = moment();

    let bonusAvailable = 0;
    let lastMonthBonus = 0;
    let lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    for (let i = 0; i < bonusInfo?.monthlyDistribution?.length; i++) {
      if (
        new Date() > new Date(bonusInfo?.monthlyDistribution[i].date) &&
        bonusInfo?.monthlyDistribution[i].status === "Locked"
      ) {
        bonusInfo.monthlyDistribution[i].status = "Available"; // Update the status
      }

      if (
        new Date(bonusInfo?.monthlyDistribution[i].date).getMonth() ==
        lastMonthDate.getMonth()
      ) {
        lastMonthBonus = bonusInfo?.monthlyDistribution[i]?.amount || 0;
  
      }

      if (bonusInfo?.monthlyDistribution[i].status === "Available") {
        bonusAvailable += parseFloat(bonusInfo.monthlyDistribution[i].amount);
      }
    }

    res.locals.isMonthPassed = lastMonthBonus;
    res.locals.lastMonthBonus = lastMonthBonus;
    res.locals.currBonusValue = bonusAvailable;
    // Assuming bonusInfo is an object with a valid vestingStartDate property
    let bonusPercentageTime = bonusInfo
      ? (
          (new Date().getTime() -
            new Date(bonusInfo.vestingStartDate).getTime()) /
          (365 * 24 * 60 * 60 * 10)
        ).toFixed(2)
      : 0;

    if (bonusInfo) {
      bonusInfo.markModified("monthlyDistribution");
      await bonusInfo.save();
    }
    res.locals.bonusPercentageTime = Math.min(
      100,
      parseFloat(bonusPercentageTime)
    );

    res.locals.bonusInfo = bonusInfo;
    const esopRows = [];
    const esopVestingPeriod = esopInfo?.vestingPeriod;
    const vestingYearCnt = esopVestingPeriod;
    const units = esopInfo?.units / vestingYearCnt;
    const esopAllotedDate = moment(esopInfo?.allotedOn);
    let esopsPercentageTime = Math.round(
      ((today.unix() * 1000 - esopInfo?.allotedOn) /
        (vestingYearCnt * 12 * 30 * 24 * 60 * 60 * 1000)) *
        100
    );
    esopsPercentageTime = Math.min(esopsPercentageTime, 100);
  
    res.locals.esopsPercentageTime =
      esopsPercentageTime == 0 ? 1 : esopsPercentageTime;

    for (let i = 0; i < vestingYearCnt; i++) {
      let esopTimeDiff = 0;
      const vestingDate = esopAllotedDate.clone().add((i + 1) * 1, "years");
      let timePeriod = `${i + 1} Year`;

      let status = false;
      if (vestingDate.isBefore(today)) {
        status = true;
      }

      esopRows.push({
        timePeriod,
        units: units.toFixed(0),
        status,
      });
    }

    let mul = 0;
    for (let i = 0; i < esopRows.length; i++) {
      if (esopRows[i].status) {
        mul++;
      } else break;
    }

    let unitsAlloted = mul * esopRows[0]?.units;
    let currValue = unitsAlloted * esopConfig?.unitValue;
    let currTotalValue = esopInfo?.units * esopConfig?.unitValue;
    res.locals.esopRows = esopRows;
    res.locals.unitsAlloted = unitsAlloted?.toFixed(0);
    res.locals.currValue = commafy(currValue?.toFixed(0));
    res.locals.currTotalValue = commafy(currTotalValue?.toFixed(0));
    res.locals.unitValue = commafy(esopConfig?.unitValue?.toFixed(0));
    res.locals.totalBonusAmount = commafy(bonusInfo?.amount?.toFixed(0));
    res.locals.firstName = admin?.firstName;
  } catch (error) {
    console.log(error);
  }
}

async function SetPerformances(
  employeeId,
  date,
  PerformanceShownbyEmployee,
  res,
  managerVisiting
) {
  try {
    res.locals.taskgetdataurl = employeeId;
    let employees = await Admin.find({});
    res.locals.employees = employees;
    const levelList = await Level.find({ employeeID: employeeId });
    levelList.sort((a, b) => {
      return a.badges - b.badges;
    });
    const BadgesLogs = await BadgesLog.find({ employeeId });
    BadgesLogs.sort((a, b) => {
      return new Date(b.allotedDate) - new Date(a.allotedDate);
    });
    // console.log(BadgesLogs)
    res.locals.badgeslogs = BadgesLogs;
    let employee = await Admin.findById(employeeId);

    let levels = [];
    let flag = 0;
    let progresslevels;
    let salary;
    let showprogress = false;
    for (let i = 0; i < levelList.length; i++) {
      if (levelList[i].badges <= employee.badges) {
        employee.currentLevel = i + 1;
        levels.push({ ...levelList[i]._doc, state: 2 });
        if (i == 0) {
          progresslevels = {
            level1: levelList[i],
            level2: levelList[i + 1],
            levelno: i,
          };
        } else {
          progresslevels = {
            level1: levelList[i - 1],
            level2: levelList[i],
            levelno: i - 1,
          };
        }
        if (employee.salary == 0) {
          salary = levelList[i]._doc;
          salary = salary?.description ? salary?.description : "monthly -15k";
          salary = salary?.split("-")[1]?.toLowerCase();
          salary = isNaN(Number(salary?.replace("k", "")) * 1000)
            ? 15000
            : Number(salary?.replace("k", "")) * 1000;
        }
      } else if (levelList[i].badges > employee.badges && flag === 0) {
        flag = 1;
        let percbadges =
          ((employee.badges - levelList[i - 1]?.badges) /
            (levelList[i].badges - levelList[i - 1]?.badges)) *
          100;
        if (PerformanceShownbyEmployee) {
          if (percbadges < 20 && i > 1 && !levelList[i - 2].progress100) {
            progresslevels = {
              level1: levelList[i - 2],
              level2: levelList[i - 1],
              levelno: i - 2,
            };
            showprogress = true;
            levelList[i - 2].progress100 = true;
            await levelList[i - 2].save();
          } else if (
            percbadges >= 20 &&
            percbadges < 50 &&
            !levelList[i - 1].progress20
          ) {
            progresslevels = {
              level1: levelList[i - 1],
              level2: levelList[i],
              levelno: i - 1,
            };
            showprogress = true;
            levelList[i - 1].progress20 = true;
            await levelList[i - 1].save();
          } else if (
            percbadges >= 50 &&
            percbadges < 70 &&
            !levelList[i - 1].progress50
          ) {
            progresslevels = {
              level1: levelList[i - 1],
              level2: levelList[i],
              levelno: i - 1,
            };
            showprogress = true;
            levelList[i - 1].progress50 = true;
            await levelList[i - 1].save();
          } else if (
            percbadges >= 70 &&
            percbadges < 100 &&
            !levelList[i - 1].progress70
          ) {
            progresslevels = {
              level1: levelList[i - 1],
              level2: levelList[i],
              levelno: i - 1,
            };
            showprogress = true;
            levelList[i - 1].progress70 = true;
            await levelList[i - 1].save();
          }
        }
        levels.push({ ...levelList[i]._doc, state: 1 });
      } else {
        levels.push({ ...levelList[i]._doc, state: 0 });
      }
    }
    if (employee.salary == 0) {
      employee.salary = salary;
    }

    const dailyTasks = await DailyTask.find({ employeeID: employee._id });
    dailyTasks.sort((a, b) => {
      return a.taskID - b.taskID;
    });

    let performanceRecord = await PerformanceRecord.findOne({
      date,
      employeeID: employee._id,
    });
    const currentTimeFormatted = managerVisiting ? "" : getCurrentTime();
    let currentTimeHours = new Date().getHours();
    if (currentTimeHours >= 8) {
      if (!performanceRecord) {
        performanceRecord = await PerformanceRecord.create({
          date,
          employeeID: employee._id,
          taskStatus: [!managerVisiting],
          submittedAt: [currentTimeFormatted, "", "", ""],
        });
      } else {
        if (!performanceRecord.taskStatus[0]) {
          performanceRecord.taskStatus[0] = !managerVisiting;
          performanceRecord.submittedAt[0] = currentTimeFormatted;
          performanceRecord.markModified("taskStatus");
          performanceRecord.markModified("submittedAt");
          await performanceRecord.save();
        } else if (performanceRecord.submittedAt[0] == "") {
          performanceRecord.submittedAt[0] = currentTimeFormatted;
          performanceRecord.markModified("submittedAt");
          await performanceRecord.save();
        }
      }
    } else {
      if (!performanceRecord) {
        performanceRecord = await PerformanceRecord.create({
          date,
          employeeID: employee._id,
          taskStatus: [false],
          submittedAt: ["", "", "", ""],
        });
      } else {
        if (!performanceRecord.taskStatus[0]) {
          performanceRecord.taskStatus[0] = false;
          performanceRecord.markModified("taskStatus");
          await performanceRecord.save();
        }
      }
    }

    let pervday = getpervday(date);
    const pervperformance = await PerformanceRecord.findOne({
      date: pervday,
      employeeID: employee._id,
    });
    let showpopup = false;
    if (
      PerformanceShownbyEmployee &&
      pervperformance &&
      pervperformance.rating > 0 &&
      !performanceRecord.perviousDayPopUp
    ) {
      showpopup = true;
      performanceRecord.perviousDayPopUp = true;
      await performanceRecord.save();
    }
    const streakDays = await streakcountdates(
      date,
      performanceRecord.employeeID,
      res
    );
   
    const today = moment();
    const dateString = today.format("YYYY-MM-DD");
    const selectedDate = moment(date, "YYYY-MM-DD");
    const startOfWeek = selectedDate.clone().startOf("isoWeek");

    const weekDays = Array.from({ length: 5 }, (_, i) => {
      const d = startOfWeek.clone().add(i, "days");
      return {
        date: d.format("YYYY-MM-DD"),
        weekDay: d.day(),
        day: d.format("dddd"),
      };
    });

    const days = today.day();
    res.locals.today = {
      date: dateString,
      days,
      day: today.format("dddd"),
    };

    res.locals.currentday = {
      date,
      weekDay: selectedDate.day(),
      day: selectedDate.format("dddd"),
    };

    const previousWeekDates = getPreviousWeekDates(date);

    const allDates = [
      ...previousWeekDates,
      ...weekDays.map((weekday) => weekday.date),
    ];

    const performances = await PerformanceRecord.find({
      date: { $in: allDates },
      employeeID: employee._id,
    });

    const performanceMap = new Map(
      performances.map((performance) => [performance.date, performance])
    );

    let avgpervbadges = 0,
      avgpervrating = 0,
      avgbadges = 0,
      avgrating = 0;

    const calculateAverages = (dates, count, badgesKey, ratingKey) => {
      let sumBadges = 0;
      let sumRating = 0;

      for (const date of dates) {
        const performance = performanceMap.get(date);
        sumBadges += performance ? performance[badgesKey] : 0;
        sumRating += performance ? performance[ratingKey] : 0;
        if (performance?.rating > 0) count++;
      }

      return {
        avgBadges: sumBadges,
        avgRating: count === 0 ? 0 : (sumRating / count).toFixed(0),
      };
    };

    const prevWeekAverages = calculateAverages(
      previousWeekDates,
      0,
      "badges",
      "rating"
    );
    avgpervbadges = prevWeekAverages.avgBadges;
    avgpervrating = prevWeekAverages.avgRating;

    const currentWeekAverages = calculateAverages(
      weekDays.map((weekday) => weekday.date),
      0,
      "badges",
      "rating"
    );
    avgbadges = currentWeekAverages.avgBadges;
    avgrating = currentWeekAverages.avgRating;
    await employee.save();
    res.locals.weekDays = weekDays;
    res.locals.showprogress = showprogress;
    res.locals.levels = levels;
    res.locals.progresslevels = progresslevels;
    res.locals.dailyTaskList = dailyTasks;
    res.locals.showpopup = showpopup;
    res.locals.performanceRecord = performanceRecord;
    res.locals.streakmonth = Number(date.split("-")[1]);
    res.locals.streakDays = streakDays;
    res.locals.selectedDate = date;
    res.locals.avgpervbadges = avgpervbadges;
    res.locals.avgpervrating = avgpervrating;
    res.locals.avgrating = avgrating;
    res.locals.avgbadges = avgbadges;
    res.locals.employee = employee;
    res.locals.user = employee;
    let yearmonth = moment(date).format("YYYY-MM");
    // setPerformanceScore(yearmonth, employee._id);
    await SetRewards(res, employee.badges - employee.usedBadges);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong" });
  }
}

const streakcountdates = async (selectedDate, employeeID, res) => {
  try {
    const streakDays = [];
    const startDate = moment(selectedDate, "YYYY-MM-DD").startOf("month");
    const endDate = moment(selectedDate, "YYYY-MM-DD").endOf("month");
   let todayDate = moment(selectedDate, "YYYY-MM-DD");
    const performances = await PerformanceRecord.find({
      employeeID,
      dateIST: { $gte: startDate.toDate(), $lte: endDate.toDate() },
    });

    const RatingReviews = await RatingReview.find({
      dateIST: { $gte: startDate.toDate(), $lte: endDate.toDate() },
      employeeId: employeeID.toString(),
    });

    let currentStreak = 0;
    let avgMonthlyRating = 0,
      monthlyBadges = 0;
    let count = 0;
    let leavesTaken = 0,
      loomsMissed = 0;
    for (
      let currentDate = startDate.clone();
      currentDate.isSameOrBefore(endDate);
      currentDate.add(1, "days")
    ) {
      const dayOfWeek = currentDate.day();

      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const nextDay = currentDate.format("YYYY-MM-DD");
        let performance = performances.find((p) => p.date === nextDay);

        if (!performance) {
          performance = await PerformanceRecord.create({
            date: nextDay,
            employeeID,
            taskStatus: [false],
          });
        }

        avgMonthlyRating += performance.rating;
        if (performance.rating > 0) count++;
        monthlyBadges += performance.badges;
       
        if (performance.rating >= 4.5) {
          currentStreak++;
          performance.streakDays = currentStreak;
          await performance.save();
        } else {
          currentStreak = 0;
        }

        const ratingReview = RatingReviews.find((rr) => rr.date === nextDay);

        let countTaskStatus = performance.taskStatus.filter(Boolean).length;
        if (performance.onleave) leavesTaken++;
        if(todayDate>currentDate)
        { 
           loomsMissed+=4-countTaskStatus;
        }
        streakDays.push({
          date: currentDate.format("YYYY-MM-DD"),
          isdone: performance.rating >= 4.5,
          rating: performance.rating,
          badges: performance.badges,
          taskStatus: performance.taskStatus,
          ratingReviewStatus: ratingReview ? ratingReview.status : "",
          managerFeedback: performance.feedback,
          onLeave: performance.onleave,
          unratable: performance.unratable,
          leaveType: performance.leaveType,
          countTaskStatus: countTaskStatus,
        });
      }
    }
    if (!res) return streakDays;
    res.locals.avgMonthlyrating =
      count === 0 ? 0 : (avgMonthlyRating / count).toFixed(2);
    res.locals.Monthlybadges = monthlyBadges;
    res.locals.leavesTaken = leavesTaken;
    res.locals.loomsMissed = loomsMissed;
    return streakDays;
  } catch (err) {
    console.log(err);
    return [];
  }
};


const getPreviousWeekDates = (selectedDate) => {
  try {
    const previousWeekDates = [];

    const startDateObj = moment(selectedDate, "YYYY-MM-DD");
    const endDateObj = startDateObj.clone().subtract(1, "week");

    let currentDate = endDateObj.clone().startOf("week");
    const weekEnd = endDateObj.clone().endOf("week");

    while (
      currentDate.isBefore(weekEnd) ||
      currentDate.isSame(weekEnd, "day")
    ) {
      const dayOfWeek = currentDate.day();

      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        previousWeekDates.push(currentDate.format("YYYY-MM-DD"));
      }
      currentDate.add(1, "day");
    }

    return previousWeekDates;
  } catch (error) {
    console.log(error);
    return [];
  }
};

function getpervday(date) {
  const currentDate = new Date(date);
  currentDate.setDate(currentDate.getDate() - 1);

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");

  const previousDateString = `${year}-${month}-${day}`;
  return previousDateString;
}

const SortProjectsTasks = async (id, res, date) => {
  try {
    const employeeID = id;
    let TaskSubmissions = await TaskSubmission.find({
      "from.id": employeeID.toString(),
    });
    let earnedBadges = 0;
    date = new Date(date);
    date.setDate(1);
    let monthStart = new Date(date); // Create a new Date object for monthStart
    let monthend = new Date(date); // Create a new Date object for monthend
    monthend.setMonth(monthend.getMonth() + 1);
    monthend.setDate(0);

    let today = new Date(date);
    let thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    let thisWeekEnd = new Date(today);
    thisWeekEnd.setDate(today.getDate() + (6 - today.getDay()));
    let lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - today.getDay() - 6);
    let lastWeekEnd = new Date(today);
    lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);

    let earnedBadgesThisMonth = 0;
    let earnedBadgesThisWeek = 0;
    let earnedBadgesLastWeek = 0;
    let avgSpeed = 0,
      avgQuality = 0,
      count = 0;

    for (let i = 0; i < TaskSubmissions.length; i++) {
      let taskSubmittedDate = new Date(TaskSubmissions[i].submittedOn);
      if (taskSubmittedDate >= monthStart && taskSubmittedDate <= monthend && TaskSubmissions[i].status=='Completed') {
        earnedBadgesThisMonth += TaskSubmissions[i].badges;
        avgSpeed += TaskSubmissions[i].speed;
        avgQuality += TaskSubmissions[i].quality;
        count++;
      }

      if (
        taskSubmittedDate >= thisWeekStart &&
        taskSubmittedDate <= thisWeekEnd
      ) {
        earnedBadgesThisWeek += TaskSubmissions[i].badges;
      }

      if (
        taskSubmittedDate >= lastWeekStart &&
        taskSubmittedDate <= lastWeekEnd
      ) {
        earnedBadgesLastWeek += TaskSubmissions[i].badges;
      }
    }
    res.locals.avgSpeed = isNaN((avgSpeed / count).toFixed(0))
      ? 0
      : (avgSpeed / count).toFixed(0);
    res.locals.avgQuality = isNaN((avgQuality / count).toFixed(0))
      ? 0
      : (avgQuality / count).toFixed(0);
    res.locals.earnedBadgesThisMonth = earnedBadgesThisMonth;
    res.locals.earnedBadgesThisWeek = earnedBadgesThisWeek;
    res.locals.earnedBadgesLastWeek = earnedBadgesLastWeek;
    res.locals.TaskSubmissions = TaskSubmissions;
    let projectsemployee = [];
    const projects = await Projects.find({});
    let teamMap = new Map();
    let teams = await TeamTable.find({});
    for (let team of teams) {
      teamMap.set(team._id.toString(), team.employees);
    }
    //console.log(projects);
    let tasks = await Tasks.find({ "data.Owner.id": employeeID.toString() });
    let nonSubmittedTasks= tasks.filter((task) => !task.submitted);
   tasks=nonSubmittedTasks;
    tasks.sort((a, b) => {
      return a.srNo - b.srNo;
    });
    let subTasks = await SubTask.find({});
    

    let subtaskMap = new Map();
    for (let task of tasks) {
      subtaskMap.set(task._id.toString(), []);
    }
    for (let subtask of subTasks) {
      let task = subtaskMap.get(subtask.data.taskId.toString());
      if (task) {
        task.push(subtask);
        subtaskMap.set(subtask.data.taskId.toString(), task);
      }
    }
    let subtasks = [];
    for (let task of tasks) {
      subtasks.push(subtaskMap.get(task._id.toString()) || []);
    }

    let TaskTableHeaders = await TableHeader.find({
      category: "ProjectTaskPageTasks",
    });
    TaskTableHeaders.sort((a, b) => {
      return a.srNo - b.srNo;
    });
    res.locals.TaskTableHeaders = TaskTableHeaders;
    subTasks.forEach((subtask)=>{
      if(subtask.length>0){
    subtask.sort((a, b) =>{
      return a.srNo - b.srNo;
    })
  }
  })
    res.locals.subTasks = subtasks;
   
    
    res.locals.initiative = tasks;

    function isEmployeePartOfProject(project) {
      let teamsEmployee = [];
      for (let team of project.teams) {
        teamsEmployee.push(...(teamMap.get(team.toString()) || []));
      }

      return (
        project.owners?.some((employee) => employee._id == employeeID) ||
        teamsEmployee.includes(employeeID)
      );
    }

    // Filter projects based on employeeId
    projectsemployee = projects.filter(isEmployeePartOfProject);
    res.locals.Projects = projectsemployee;

    let kr = await KR.find({});
    res.locals.krs = kr;
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server Error" });
  }
};

const SetRewards = async (res, badges) => {
  try {
    const sheets = new Sheets();
    const auth = await sheets.googleAuth();

    const rewardsdata = await sheets.readRow({
      spreadsheetId: "1Zd9z4_v9etwEfdm4Jbd-kV6LbuVSscoBtonjF8KRqlY",
      auth: auth,
      sheetName: "Sheet1",
    });
    rewardsdata.sort(
      (a, b) => Math.abs(a[2] - badges) - Math.abs(b[2] - badges)
    );

    let nextTwoRewards = rewardsdata
      .filter((reward) => reward[2] > badges)
      .slice(0, 2);

    if (nextTwoRewards.length === 0) nextTwoRewards = [rewardsdata[0]];

    res.locals.rewards = nextTwoRewards;
  } catch (err) {
    console.log(err);
  }
};

function getCurrentTime() {
  const currentTime = new Date();
  let hours = currentTime.getHours();
  let minutes = currentTime.getMinutes();
  let amOrPm = hours >= 12 ? "pm" : "am";

  // Convert to 12-hour format
  hours = hours % 12 || 12;

  // Add leading zero for single-digit minutes
  minutes = minutes < 10 ? "0" + minutes : minutes;

  return `${hours}.${minutes} ${amOrPm}`;
}

function getWeekdaysInRange(dates) {
  const dateRange = dates.split("-");
  const startDate = new Date(dateRange[0]);
  const endDate = new Date(dateRange[1]);
  const result = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay(); // Sunday: 0, Monday: 1, ..., Saturday: 6
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      result.push(formatDate(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}
async function setPerformanceScore(monthYear, employeeId) {
  try {
    const today = new Date();
    let performanceScoreModal=await PerformanceScoreModal.findOne({employeeId:employeeId,monthYear:monthYear});
    const employee = await Admin.findById(employeeId);
    
    if (!performanceScoreModal) {

      if (employee.performanceTypeForFutureMonths) {
        const previousMonth = moment(monthYear).subtract(1, 'months').format('YYYY-MM');
        const previousPerformanceScoreModal = await PerformanceScoreModal.findOne({
          employeeId,
          monthYear: previousMonth,
        });

        if (previousPerformanceScoreModal) {
          const { performanceCalculateType, MatrixWeightage, performanceScore, level } = previousPerformanceScoreModal;

          performanceScoreModal =
            performanceCalculateType !== 'Automatic'
              ? await PerformanceScoreModal.create({ employeeId, monthYear, performanceCalculateType, performanceScore, level })
              : await PerformanceScoreModal.create({ employeeId, monthYear, performanceCalculateType, MatrixWeightage });
        } else {
          performanceScoreModal = await PerformanceScoreModal.create({ employeeId, monthYear });
        }
      } else {
        performanceScoreModal = await PerformanceScoreModal.create({ employeeId, monthYear });
      }
    }
    if(performanceScoreModal.performanceCalculateType=='Automatic')
    {
    const streakDays = await streakcountdates(monthYear, employeeId);

    let avgRating = 0,
      totalBadges = 0,
      totalLeaves = 0,
      totalLoomMissed = 0,
      ratingcount = 0,
      avgQuality = 0,
      avgSpeed = 0,
      earnedBadgesThisMonth = 0;
      
    for (const data of streakDays) {
      if (data.rating > 0) ratingcount++;
      avgRating += data.rating;
      totalBadges += data.badges;
      if (data.onLeave && data.leaveType=='unpaid') totalLeaves++;
      else if (data.date > today.date)
        totalLoomMissed += 4 - data.countTaskStatus;
    }

    const TaskSubmissions = await TaskSubmission.find({
      "from.id": employeeId.toString(),
    });

    const date = new Date(monthYear);
    date.setDate(1);
    const monthStart = new Date(date);
    const monthend = new Date(date);
    monthend.setMonth(monthend.getMonth() + 1);
    monthend.setDate(0);
    let count = 0;

    for (const submission of TaskSubmissions) {
      const taskSubmittedDate = new Date(submission.submittedOn);

      if (taskSubmittedDate >= monthStart && taskSubmittedDate <= monthend && submission.status=='Completed') {
        earnedBadgesThisMonth += submission.badges;
        avgSpeed += submission.speed;
        avgQuality += submission.quality;
        count++;
      }
    }

    avgSpeed = isNaN((avgSpeed / count).toFixed(0)) ? 0: (avgSpeed / count).toFixed(0);
    avgQuality = isNaN((avgQuality / count).toFixed(0))? 0: (avgQuality / count).toFixed(0);
avgRating=(ratingcount === 0 ? 0 : avgRating / ratingcount.toFixed(3))
avgRating=avgRating/5;
performanceScoreModal.performanceMatrix=[avgRating,ratingcount==0?0:parseFloat(totalBadges/ratingcount),parseFloat(avgSpeed/10),parseFloat(avgQuality/10),earnedBadgesThisMonth,totalLeaves,totalLoomMissed]
   
let performanceScore = parseFloat(
  performanceScoreModal.MatrixWeightage[0]*parseFloat(performanceScoreModal.performanceMatrix[0])  +
  performanceScoreModal.MatrixWeightage[3]*parseFloat(performanceScoreModal.performanceMatrix[3]) +
  performanceScoreModal.MatrixWeightage[2]*parseFloat(performanceScoreModal.performanceMatrix[2]) +
  parseFloat(performanceScoreModal.performanceMatrix[1])*performanceScoreModal.MatrixWeightage[1] + (parseFloat(performanceScoreModal.performanceMatrix[4]) /15)*performanceScoreModal.MatrixWeightage[4]
).toFixed(0);
performanceScore=parseFloat(performanceScore)

    if (totalLoomMissed > 5) {
      performanceScore +=parseFloat(totalLoomMissed* performanceScoreModal.MatrixWeightage[6]);
    }
   
    if (totalLeaves > 1) {
      performanceScore += parseFloat(totalLeaves * performanceScoreModal.MatrixWeightage[5]);
    }
   
    performanceScore=Math.max(0,performanceScore);
   
    if (performanceScore > 100) performanceScore = 0;

    performanceScore = isNaN(performanceScore) ? 0 : performanceScore;
   
    
      performanceScoreModal.score=performanceScore;
      let level={};

       if (performanceScore > 90) { 
        level.info=`<span style="color: #48bf84; background: var(--Success-50, #ECFDF3); padding: 2px 8px 2px 6px; border-radius: 16px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none"><circle cx="4" cy="4" r="3" fill="#48BF84"/></svg> Superb
      </span>`
      } else if (performanceScore > 80) {
        level.info=` <span style="color: #2E90FA; background: var(--Blue-50, #EFF8FF); padding: 2px 8px 2px 6px; border-radius: 16px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="9" height="8" viewBox="0 0 9 8" fill="none"><circle cx="4.66797" cy="4" r="3" fill="#2E90FA"/></svg> Great
            </span>`
          
      } else if (performanceScore > 50) {
        level.info=`  <span style="color: var(--Warning-500, #FDB022); background: var(--Warning-50, #FFFAEB); padding: 2px 8px 2px 6px; border-radius: 16px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="9" height="8" viewBox="0 0 9 8" fill="none"><circle cx="4.33203" cy="4" r="3" fill="#FDB022"/></svg> Fair
             </span>`
         
    } else {
      level.info=`  <span style="color: var(--Error-500, #EF4444); background: var(--Error-50, #FEF3F2); padding: 2px 8px 2px 6px; border-radius: 16px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="9" viewBox="0 0 8 9" fill="none"><circle cx="4" cy="4.1582" r="3" fill="var(--Error-500, #EF4444)" /></svg> Poor    </span>`
     }
      performanceScoreModal.level=level;
     await performanceScoreModal.save();
     
    }
    return performanceScoreModal;
  } catch (error) {
    console.error("Error in SetPerformancesScore:", error);
    return 0;
  }
}
router.get('/PerformanceInsightsMonths/', ensureAuth, async (req, res) => {
  try {
let months=req.query.months;
let employeeId=req.query.employeeId;
let PerformanceInsightsMonths=[]
for(let i=0;i<months.length;i++)
{ let monthYear=months[i].monthYear;
 let data=await PerformanceScoreModal.find({monthYear,employeeId});
 let IconStyle='';
 if(data?.level?.type){
 if(data?.level?.type=='Superb')
 {
  IconStyle=`<div style="display: flex;
  width: 32px;
  height: 32px;
  padding: 7.893px 7.823px 8.107px 8.177px;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  border: 5.714px solid var(--Success-50, #ECFDF3);
background: var(--Success-100, #D1FADF);">
  <img src="../NudgeType/Trophy.svg">
  </div>`
 }
 else if(data.level.type=='Great')
  {
   IconStyle=`<div style="display: flex;
   width: 32px;
   height: 32px;
   padding: 7.893px 7.823px 8.107px 8.177px;
   justify-content: center;
   align-items: center;
   border-radius: 16px;
   border-radius: 28px;
   border: 5.714px solid var(--Blue-50, #EFF8FF);
   background: var(--Blue-100, #D1E9FF);">
   <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
   <g clip-path="url(#clip0_462_2361)">
     <path d="M15.1663 7.3843V7.99763C15.1655 9.43525 14.7 10.8341 13.8392 11.9855C12.9785 13.1369 11.7685 13.9793 10.3899 14.3869C9.0113 14.7945 7.53785 14.7456 6.18932 14.2474C4.8408 13.7491 3.68944 12.8284 2.90698 11.6223C2.12452 10.4163 1.75287 8.98967 1.84746 7.55517C1.94205 6.12067 2.49781 4.75518 3.43186 3.66235C4.36591 2.56951 5.6282 1.80789 7.03047 1.49106C8.43274 1.17424 9.89985 1.31919 11.213 1.9043M15.1663 2.6643L8.49968 9.33763L6.49968 7.33763" stroke="#2E90FA" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
   </g>
   <defs>
     <clipPath id="clip0_462_2361">
       <rect width="16" height="16" fill="white" transform="translate(0.5 -0.00244141)"/>
     </clipPath>
   </defs>
 </svg>
   </div>`
  }
  else if(data.level.type=='Fair')
  {
    IconStyle=`<div style="display: flex;
    width: 32px;
    height: 32px;
    padding: 7.893px 7.823px 8.107px 8.177px;
    justify-content: center;
    align-items: center;
    border-radius: 16px;
    border: 4px solid var(--Warning-50, #FFFAEB);
    background: var(--Warning-100, #FEF0C7);">
    <img src="../NudgeType/ImprovementSuggestion.svg">
    </div>`

  }
  else if(data.level.type=='Poor')
  {
IconStyle=`<div style="display: flex;
width: 32px;
height: 32px;
padding: 7.893px 7.823px 8.107px 8.177px;
justify-content: center;
align-items: center;
border-radius: 16px;
border: 4px solid var(--Error-50, #FEF3F2);
background: var(--Error-100, #FEE4E2);
">
<img src="../NudgeType/CautionaryAlert.svg">
</div>`
  }
}
else{
  IconStyle=`<div style="display: flex;
  width: 32px;
  height: 32px;
  padding: 7.893px 7.823px 8.107px 8.177px;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  border: 5.714px solid var(--Gray-50, #F9FAFB);
  background: var(--Gray-100, #F2F4F7);">
  <img src="../NudgeType/ClockDisabled.svg">
  </div>`
  data.level={info:`<div style="display: flex;
  padding: 4px 12px;
  justify-content: center;
  align-items: center;
  color: var(--Gray-500, #667085);
text-align: center;
font-size: 14px;
font-style: normal;
font-weight: 500;
line-height: 20px; /* 142.857% */
  border-radius: 16px;
  background: var(--Gray-50, #F9FAFB);">Pending</div>`}
}
  PerformanceInsightsMonths.push({monthYear:months[i].monthYear,level:data.level,IconStyle:IconStyle,monthYearText:months[i].monthYearText});
}
res.status(200).send({PerformanceInsightsMonths})

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


router.get('/performanceModal', async (req, res) => {
  try {
    const employeeId = req.query.id;
    const monthYear = req.query.monthYear;
    
    let performanceScoreModal = await setPerformanceScore(monthYear, employeeId)

    let performanceAll = await PerformanceScoreModal.find({monthYear});
     let topScore=JSON.parse(JSON.stringify(performanceAll[0]));
    
     for (let i = 0; i < performanceAll.length; i++)
      {
        if (performanceAll[i].score > topScore.score)
        topScore = JSON.parse(JSON.stringify(performanceAll[i]));
      }
      let employeeDetails=await Admin.findById(topScore.employeeId);
     
      topScore.name=employeeDetails.displayName;
      topScore.image=employeeDetails.image;
     
    res.send({ performanceScoreModal,topScore });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server Error" });
  }
});

router.put('/performanceModal',async(req,res)=>{
  try{
    let id=req.body.id;
    let data=req.body.data;
    let FutureAllow=req.body.FutureAllow;
    let employee=await Admin.findById(data.employeeId);
    employee.performanceTypeForFutureMonths=FutureAllow;
    await employee.save();
    let performanceScoreModal=await PerformanceScoreModal.findByIdAndUpdate(id,data);
    res.send({message:"success"});
  }
  catch(err){
    console.log(err);
    res.status(500).send({message:"Server Error"});
  }
})
async function submiteod() {
  let employeeId = "6476f585a45df7fb73a44035";
  let performance_ = await PerformanceRecord.findOne({
    employeeID: employeeId,
    date: "2024-01-17",
  });
  let performance= await PerformanceRecord.findOne({
    employeeID: employeeId,
    date: "2024-01-18",
  });

  performance_.taskStatus = [true,true,true,true];
  performance_.submittedAt[3] =performance.submittedAt[3];
  performance_.submittedAt[4] =performance.submittedAt[4];
  performance_.links[2]=performance.links[2];
  performance_.links[3]=performance.links[3];
  performance_.keyPoints=performance.keyPoints;
  // performance.submittedAt[1] = "12.12 pm";
  // performance.taskStatus = [true, true, true, true];
  // performance.links[1] =
  //   "https://www.loom.com/share/d0528c1ae1be4e7898270ba2d1c5465a?sid=949da62d-f4ab-4ad4-bd39-4d5f3f18d81b";
  performance_.markModified("taskStatus");
  performance_.markModified("links");
  performance_.markModified("submittedAt");
  await performance_.save();

  // let admin=await Admin.findById(employeeId);
  // admin.badges=142;
  // await admin.save();
  //await TaskSubmission.deleteMany({ });
}

//submiteod()
module.exports = router;

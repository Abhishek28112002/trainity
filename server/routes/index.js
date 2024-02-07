const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const moment = require("moment");
const axios = require("axios");
const XLSX = require("xlsx");
const jsontoxml = require("jsontoxml");
const Excel = require("exceljs");
const Leaves = mongoose.model("leave");
const cron = require('node-cron');
const TeamTable = mongoose.model("TeamTable");
const {
  ensureGuest,
  ensureAuth,
  ensureManager,
} = require("../middleware/auth");
const AuthorizedAdmin = mongoose.model("authorizedAdmins");
const Admin = mongoose.model("admins");
const PerformanceRecord = mongoose.model("performanceRecords");
const MilestoneProject = mongoose.model("milestoneProjects");
const Level = mongoose.model("levels");
const Rewards = mongoose.model("rewards");
const LeaveIssue= mongoose.model('leaveissue');
const RatingReview = mongoose.model("ratingReview");
const {
  createSuggestion,
  getTags,
  getSuggestions,
  upVoteSuggestion,
} = require("../services/notion");
// sign in page
let MasterAdmin = ['647093e88603a9cc6900c151','64743fefe221274086131b6f','64b54e0432653edfc88591c4','64ce78c866625d0fefe74456','64e72baf9f92934f548f1cd9','64ef511864bd29075ba2102d']

router.get("/", ensureGuest, (req, res) => {
  try{
  res.render("login");
  }
  catch(err)
  {
    console.log(err);
    res.status(500).send({message:"Something went wrong"});
  }
});

// for creating an admin account render page
router.get("/admin/create", ensureAuth, ensureManager, (req, res) => {
  try{
  res.render("create-admin");
}
  catch(err)
  {
    console.log(err);
    res.status(500).send({message:"Something went wrong"});
  }
});

// create an admin account
router.post("/admin/create", async (req, res) => {
  
  try {
    const { email, team, phone,employmentType } = req.body;
  const position = Number(req.body.position);

    let authorizedAdmin = await AuthorizedAdmin.findOne({ email });
    if (!authorizedAdmin) {
      authorizedAdmin = await AuthorizedAdmin.create({
        email,
        phone,
        position,
        team,
        employmentType
      });
    } else {
      authorizedAdmin.team = team;
      authorizedAdmin.position = position;
      authorizedAdmin.phone = phone;
      authorizedAdmin.email = email;
      await authorizedAdmin.save();
    }

    res.status(200).send({ status: 200, authorizedAdmin });
  } catch (error) {
    console.log(error);
    res.send({
      error: "Something went wrong",
    });
  }
});

// edit admin details
router.put("/admin/create", async (req, res) => {
  
  try {
    const employeeId = req.body.EmployeeId;
  const { email, team, phone,employmentType } = req.body;
  const position = Number(req.body.position);
    let admin = await AuthorizedAdmin.findOneAndUpdate(
      { email },
      { team, position, phone, email,employmentType }
    );

    admin = await Admin.findByIdAndUpdate(employeeId, {
      email,
      phone,
      position,
      team,
      employmentType
    });
    if (!admin) {
      return res.status(404).send({ error: "Admin not found" });
    }

    res.status(200).send({ status: 200, admin: admin });
  } catch (error) {
    console.log(error);
    res.send({
      error: "Something went wrong",
    });
  }
});

// Delete Admin Account
router.delete("/admin/create", async (req, res) => {
  try {
    const email = req.body.email;
    const employeeId = req.body.employeeId;
    await AuthorizedAdmin.deleteMany({ email: email });
    await Admin.deleteMany({ _id: employeeId });
    await PerformanceRecord.deleteMany({ employeeID: employeeId });
    await Level.deleteMany({ employeeID: employeeId });
    
    FilterTeamEmployees()
    res.status(200).send({ status: 200, message: "Deleted" });
  } catch (error) {
    console.log(error);
    res.send({
      error: "Something went wrong",
    });
  }
});

// remove manager from employee profile
router.put("/remove/manager", async (req, res) => {
 
  try {
    const employeeId = req.body.employeeID;
    const managerId = req.body.managerID;
    let admin = await Admin.findById(employeeId);
    if (!admin) {
      return res.status(404).send({ error: "Admin not found" });
    }
    const index = admin.managerID.indexOf(managerId);
    admin.managerID.splice(index, 1);
    admin.markModified("managerID");
    await admin.save();

    res.status(200).send({ status: 200, admin });
  } catch (error) {
    console.log(error);
    res.send({
      error: "Something went wrong",
    });
  }
});

router.get("/get/manager/:id", ensureAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (admin) res.status(200).send({ status: 200, admin: admin });
    else
      res.status(500).send({
        error: "not found",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});

router.get("/allot/manager", ensureAuth, async (req, res) => {
try{
  const admins = await Admin.find({});
  res.locals.adminList = admins;
  res.render("allot-manager");
}
catch(err)
{
  console.log(err);
  res.status(500).send({message:"Something went wrong"});
}
});


router.get("/AddorAssign/employee", ensureAuth, async (req, res) => {
  try{
  const admins = await Admin.find({});
  let unassignedemployee = [];
  let assignedemployee = [];
  let managers = [];

  for (let i = 0; i < admins.length; i++) {
    if (admins[i].position == 0) managers.push(admins[i]);
    else if (admins[i].managerID.length == 0 || admins[i].managerID[0] == "")
      unassignedemployee.push(admins[i]);
    else assignedemployee.push(admins[i]);
  }
  res.locals.unassignedemployee = unassignedemployee;
  res.locals.assignedemployee = assignedemployee;
  let managerList = managers.map((manager) => {
    const employees = [];
    for (let i = 0; i < admins.length; i++) {
      for (let j = 0; j < admins[i].managerID.length; j++) {
        if (admins[i].managerID[j] == manager._id.toString()) {
          employees.push(admins[i]);
          break;
        }
      }
    }
    return {
      manager: manager,
      employees: employees,
    };
  });
  const userIndex = managerList.findIndex(
    (item) => item.manager._id.toString() == req.user._id.toString()
  );

  if (userIndex !== -1) {
    const userManager = managerList.splice(userIndex, 1)[0];
    managerList.unshift(userManager);
  }

  res.locals.managerList = managerList;
  res.render("allot-assign-employee");
}
catch(err)
{
  console.log(err);
  res.status(500).send({message:"Something went wrong"});
}
});

router.get("/all-employee", ensureAuth, async (req, res) => {
  try{
  const admins = await Admin.find({});
  let unassignedemployee = [];
  let assignedemployee = [];

  for (let i = 0; i < admins.length; i++) {
    if (admins[i].position == 0) continue;
    else if (admins[i].managerID.length == 0 || admins[i].managerID[0] == "")
      unassignedemployee.push(admins[i]);
    else assignedemployee.push(admins[i]);
  }
  res.locals.unassignedemployee = unassignedemployee;
  res.locals.assignedemployee = assignedemployee;
  res.render("all-employee");
}
catch(err)
{
  console.log(err);
  res.status(500).send({message:"Something went wrong"});
}
});

router.post("/allot/manager", ensureAuth, async (req, res) => {
  try {
    const managerId = req.body.managerID;
    const employeeIDs = req.body.employeeIDs;
    for (let i = 0; i < employeeIDs.length; i++) {
      let employeeID = employeeIDs[i];
      const employee = await Admin.findById(employeeID);
      if (employee) {
        employee.managerID.push(managerId);
        employee.markModified("managerID");
        await employee.save();
      }
    }

    res.status(200).send({ status: 200, message: "done" });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});

router.get("/dashboard", ensureAuth, (req, res) => {
try{
  res.locals.user = req.user;
  res.render("dashboard");
}
catch(err)
{
  console.log(err);
  res.status(500).send({message:"Something went wrong"});
}
});
router.get("/achievementWall/:employeeId", ensureAuth, async(req, res) => {
  try{
    let user= await Admin.findById(req.params.employeeId);
    res.locals.user = user;
    const months = [
      { month: 'January', status: 'Pending' },
      { month: 'February', status: 'Great' },
      { month: 'March', status: 'Medium' },
      { month: 'April', status: 'Pending' },
      { month: 'May', status: 'Great' },
      { month: 'June', status: 'Medium' },
      { month: 'July', status: 'Pending' },
      { month: 'August', status: 'Great' },
      { month: 'September', status: 'Medium' },
      { month: 'October', status: 'Pending' },
      { month: 'November', status: 'Great' },
      { month: 'December', status: 'Medium' }
    ];
    
    res.locals.months=months;
    res.locals.employee = user;
    res.render("achievementWall");
  }
  catch(err)
  {
    console.log(err);
    res.status(500).send({message:"Something went wrong"});
  }
  });
router.delete("/employee/:employeeId", async (req, res) => {
  try {
    const employee = await Admin.findByIdAndDelete(req.params.employeeId);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/management/:date", ensureAuth, ensureManager, async (req, res) => {
  try {
    const employeeList = await Admin.find({});
    let date = req.params.date;
    if (!date) {
      const today = moment();
      date = today.format("YYYY-MM-DD");
    }

    res.locals.date = date;
    const performanceRecords = await PerformanceRecord.find({ date });
    res.locals.employeeList = employeeList;

    let adminPerformanceList = await Promise.all(
      employeeList.map(async (admin) => {
        if (Object.keys(admin.leaves).length === 0) {
          admin.leaves = {
            paid: { used: 0, total: 2 },
            unpaid: { used: 0, total: 4 },
          };
    
          await admin.save();
        }
        let performanceRecord = performanceRecords.find(
          (record) => record.employeeID == admin._id.toString()
        );

        if (!performanceRecord) {
          performanceRecord = await PerformanceRecord.create({
            date,
            employeeID: admin._id.toString(),
            taskStatus: [false],
          });
        }

        return {
          admin: admin,
          performanceRecord: performanceRecord,
        };
      })
    );

    adminPerformanceList.sort((a, b) => {
      // Compare based on taskStatus
      const aTaskStatus = a.performanceRecord
        ? a.performanceRecord.taskStatus
        : [];
      const bTaskStatus = b.performanceRecord
        ? b.performanceRecord.taskStatus
        : [];

      for (let i = 0; i < 4; i++) {
        // Convert undefined or null to false (assuming taskStatus is a boolean array)
        const aStatus = Boolean(aTaskStatus[i]);
        const bStatus = Boolean(bTaskStatus[i]);

        if (aStatus && !bStatus) {
          return -1; // a comes before b
        } else if (!aStatus && bStatus) {
          return 1; // b comes before a
        }
      }

      return 0; // a and b are equal
    });
    let allRatingReview = await RatingReview.find({});
    let ratingReviewList = await Promise.all(
      allRatingReview.map(async (ratingreview) => {
        let admin = employeeList.find(
          (user) => user._id == ratingreview.employeeId
        );
        let performancerecord = await PerformanceRecord.findOne({
          employeeID: ratingreview.employeeId,
          date: ratingreview.date,
        });
        if (admin) {
          if (!performancerecord) {
            performancerecord = await PerformanceRecord.create({
              date,
              employeeID: ratingreview.employeeId.toString(),
              taskStatus: [false],
            });
          }
          return {
            admin: admin,
            performanceRecord: performancerecord,
            ratingReview: ratingreview,
          };
        }
      })
    );
    // Filter out undefined items
     ratingReviewList = ratingReviewList.filter((item) => item !== undefined);
  

    // Group items by date
    const ReviewListgroupedByDate = {};
    ratingReviewList.forEach((item) => {
      const date = item.ratingReview.date;
      if (ReviewListgroupedByDate[date]) {
        ReviewListgroupedByDate[date].data.push(item);
      } else {
        ReviewListgroupedByDate[date] = {
          date: date,
          data: [item],
        };
      }
    });
    let leaveIssues = await LeaveIssue.find({});
    let LeaveIssueRecords = []; // Renamed to avoid confusion with the array name
    for (let i = 0; i < leaveIssues.length; i++) {
      if(leaveIssues[i].status === 'pending') {
      let performanceRecord = await PerformanceRecord.findOne({
        employeeID: leaveIssues[i].employeeId,
        date: leaveIssues[i].date,
      });
    
    
      if (!performanceRecord) {
        performanceRecord = await PerformanceRecord.create({
          employeeID: leaveIssues[i].employeeId,
          date: leaveIssues[i].date,
          taskStatus: [false],
        });
      }
    
      let admin = employeeList.find((user) => user._id == leaveIssues[i].employeeId);
    
      LeaveIssueRecords.push({
        admin: admin,
        performanceRecord: performanceRecord,
        leaveIssue: leaveIssues[i],
      });
    }
    }
    
    // Now you have LeaveIssueRecords array populated with the required data
 res.locals.leaveIssues=LeaveIssueRecords;    
    // Convert the grouped object to an array
    ratingReviewList = Object.values(ReviewListgroupedByDate);

    res.locals.ratingReviewList = ratingReviewList;
    res.locals.adminPerformanceList = adminPerformanceList;
    res.render("management");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/task/create", async function (req, res) {
  try {
  
    res.status(200).send({ message: "Added" });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: "failed" });
  }
});



router.post('/task/create_new', async (req, res) => {
try{
 
  res.status(200).send({message:"OK"});
}
catch(error)
{
  res.status(500).send({message:"not OK"});
}

})

//sending notificatio by slack for task update of employee


async function FindAdminPerformanceList(date) {
  try{
  const performanceRecords = await PerformanceRecord.find({
    date,
  });
  const employeeList = await Admin.find({});
  let adminPerformanceList = employeeList.map((admin) => {
    const performanceRecord = performanceRecords.find(
      (record) => record.employeeID == admin._id.toString()
    );
    return {
      admin: admin,
      PerformanceRecord: performanceRecord,
    };
  });

  return adminPerformanceList;
}
catch(error)
{
  console.log(error);
}
}

function getpervday(date) {
  const currentDate = new Date(date);
  currentDate.setDate(currentDate.getDate() - 1);

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");

  const previousDateString = `${year}-${month}-${day}`;
  return previousDateString;
}

async function SendNotification() {
  try {
    const new_day = moment();
    const new_date = new_day.format("YYYY-MM-DD");
    let adminPerformanceList = await FindAdminPerformanceList(new_date);
    let filteredAdmins = adminPerformanceList.filter(admins => !MasterAdmin.includes(admins.admin._id.toString()));
    adminPerformanceList = filteredAdmins
    let SubmmitedTask = "";
    let PendingTask = "";
    let currenttime = new Date();

    let tasktitle = "";
    let sendnotification = false;

    //eod notification for rating
    if (
      currenttime.getHours() === 9 &&
      new_day.day() !== 0 &&
      new_day.day() !== 1
    ) {
      let sendeodupdate = "";
      let prev_day = getpervday(new_date); // Correct 'perv_day' to 'prev_day'
      
      let eodadminlist = await FindAdminPerformanceList(prev_day); // Correct 'FindAdminPerformanceList' to appropriate function name
      let filteredAdmins = eodadminlist.filter(admins => !MasterAdmin.includes(admins.admin._id.toString()));
      eodadminlist = filteredAdmins;
      for (let i = 0; i < eodadminlist.length; i++) {
        let link = eodadminlist[i].PerformanceRecord
          ? eodadminlist[i].PerformanceRecord.links[3]
          : "";
        if (link !== "" && eodadminlist[i].PerformanceRecord.rating === 0) {
          
          sendeodupdate += `${eodadminlist[i].admin.displayName}     <https://admin.trainity.ninja/management/${prev_day}|Rate  ${eodadminlist[i].admin.displayName} Now>  \n`;
        }
      }
      if (sendeodupdate !== "") {
        let message = {
          unfurl_media: false,
          unfurl_links: true,
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: `Uploaded EOD but not Rated :star:  Date:${prev_day}`,
                emoji: true,
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: sendeodupdate,
              },
            },
          ],
        };
        const slackResult = await axios.post(
          "https://hooks.slack.com/services/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",
          message
        );
        //testing
        // const slackResult = await axios.post('https://hooks.slack.com/services/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', message);
      }
    }
    if (new_day.day() !== 0 && new_day.day() !== 6) {
      if (currenttime.getHours() === 12) {
        tasktitle = "Morning Loom Video";
        sendnotification = true;
        for (let i = 0; i < adminPerformanceList.length; i++) {
          let link = adminPerformanceList[i].PerformanceRecord
            ? adminPerformanceList[i].PerformanceRecord.links[1]?.trim() || ""
            : "";
          if (link !== "") {
            SubmmitedTask += `${adminPerformanceList[i].admin.displayName}     <${link}|Check it>  \n`;
          } else {
            PendingTask += ` ${adminPerformanceList[i].admin.displayName},`;
          }
        }
      } else if (currenttime.getHours() === 17) {
        tasktitle = "Noon Loom Video";
        sendnotification = true;

        for (let i = 0; i < adminPerformanceList.length; i++) {
          let link =
            adminPerformanceList[i].PerformanceRecord &&
            adminPerformanceList[i].PerformanceRecord.links.length > 1
              ? adminPerformanceList[i].PerformanceRecord.links[2]
              : "";
          if (link !== "") {
            SubmmitedTask += `${adminPerformanceList[i].admin.displayName}     <${link}|Check it>  \n`;
          } else {
            PendingTask += ` ${adminPerformanceList[i].admin.displayName},`;
          }
        }
      } else if (currenttime.getHours() === 22) {
        tasktitle = "EOD Loom Video";
        sendnotification = true;
        for (let i = 0; i < adminPerformanceList.length; i++) {
          let link =
            adminPerformanceList[i].PerformanceRecord &&
            adminPerformanceList[i].PerformanceRecord.links.length > 2
              ? adminPerformanceList[i].PerformanceRecord.links[3]
              : "";

          if (link !== "") {
            SubmmitedTask += `${adminPerformanceList[i].admin.displayName}     <${link}|Check it>  \n`;
          } else {
            PendingTask += ` ${adminPerformanceList[i].admin.displayName},`;
          }
        }
      }
    }

    if (sendnotification) {
      const message = {
        unfurl_media: false,
        unfurl_links: true,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `Pending ${tasktitle} Date:${new_date}`,
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "plain_text",
              text: PendingTask,
              emoji: true,
            },
          },
          {
            type: "divider",
          },
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `Uploaded ${tasktitle}`,
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: SubmmitedTask,
            },
          },
        ],
      };

      const slackResult = await axios.post(
        "https://hooks.slack.com/services/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",
        message
      );

      //testing
      // const slackResult = await axios.post('https://hooks.slack.com/services/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', message);
    }
  } catch (error) {
    console.log(error);
  }
}
// cron.schedule('0 9,12,17,22 * * *', async () => {
//   await SendNotification();
// });

function getpervday(date) {
  const currentDate = new Date(date);
  currentDate.setDate(currentDate.getDate() - 1);

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");

  const previousDateString = `${year}-${month}-${day}`;
  return previousDateString;
}


async function CheckLeaveForEmployee() {
  try {
    let admins = await Admin.find({});
    let currentDate = new Date(); // Get the current date
    let previousDate = new Date(); // Get
     previousDate.setDate(currentDate.getDate() - 1); 
  
let filteredAdmins = admins.filter(admin => !MasterAdmin.includes(admin._id.toString()));

    if (previousDate.getDay() != 0 && previousDate.getDay() != 6) {
      for (const employee of filteredAdmins) {
        previousDate=getpervday(currentDate);
        let counttask = 0;
        let performance = await PerformanceRecord.findOne({
          employeeID: employee._id,
          date: previousDate,
        });
        if(!performance)
        {
          performance=await PerformanceRecord.create({
            employeeID: employee._id,
            date: previousDate,
            taskStatus: [false],
          });
        }
        for (let i = 0; i < performance?.taskStatus?.length; i++) {
          if (performance?.taskStatus[i] == true) counttask++;
        }
        let eodupdate=performance?.taskStatus?.length==4?performance.taskStatus[3]:false;

        if (( counttask <=1 || !eodupdate ) && performance?.onleave == false) {
         
          let leavetype;
          let paidleaverem =  employee.leaves.paid.total - employee.leaves.paid.used;
          if (paidleaverem > 0) {
            leavetype = { type: "paid", day: 1 };
            employee.leaves.paid.used = Math.min(employee.leaves.paid.total, employee.leaves.paid.used + 1);
          } else {
            leavetype = { type: "unpaid", day: 1 };
            employee.leaves.unpaid.used = Math.min(employee.leaves.unpaid.total, employee.leaves.unpaid.used + 1);
          }
          let leave = await Leaves.create({
            dates: `${previousDate} - ${previousDate}`,
            employeeId: employee._id,
            durationType: "Short Leave",
            totalDayLeaves: 1,
            leaveType: leavetype,
            status: "Accepted",
            takenByEmployee:false
          });
          performance.onleave = true;
          performance.leaveType=leavetype.type;
          employee.markModified("leaves");
          await employee.save();
          await performance.save();
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

cron.schedule('0 14 * * *', async () => {
  await CheckLeaveForEmployee();
});

async function UpdateSalary()
{ try{
  let admins = await Admin.find({});
  let currentDate = new Date(); // Get the current date
 

let filteredAdmins = admins.filter(admin => !MasterAdmin.includes(admin._id.toString()));
  if (currentDate.getDate()==1) {
    
    for (const employee of filteredAdmins) {
      const levelList = await Level.find({ employeeID: employee._id });
  levelList.sort((a, b) => {
    return a.badges - b.badges;
  });
  for (let i = 0; i < levelList.length; i++) {
    if (levelList[i].badges <= employee.badges) {
      employee.currentLevel =i+1;
     salary=levelList[i]._doc;
    
     salary=salary?.description?salary?.description:'monthly -15k';
     salary=salary?.split('-')[1]?.toLowerCase();
    salary = isNaN(Number(salary?.replace('k', '')) * 1000)?15000:Number(salary?.replace('k', '')) * 1000; 
    employee.salary=salary
    }
    else
    break;
   
  }
  let salaryHikeMonthly=employee.salaryHikeMonthly;
  if(salaryHikeMonthly[salaryHikeMonthly.length-1].salary!=employee.salary)
  {
    salaryHikeMonthly.push({date:currentDate,salary:employee.salary});
  }
  //console.log(employee.displayName,employee.salary);
  await employee.save();
    }
}
}
catch(error)
{
  console.log(error);
}

}

// cron.schedule('0 0 1 * *', async () => {
//   await UpdateSalary();
// });

async function AddLeavestoEmployee()
{
  try{
  let admins = await Admin.find({});
  let currentDate = new Date(); // Get the current date
 
  if (currentDate.getDate()==1) { 
    for (const employee of admins) {
       employee.leaves.paid.total=Math.max(0,employee.leaves.paid.total-employee.leaves.paid.used);
       employee.leaves.paid.total+=2;
       employee.leaves.paid.used=0;
       employee.leaves.unpaid.total=Math.max(0,employee.leaves.unpaid.total-employee.leaves.unpaid.used);
       employee.leaves.unpaid.total=4;
       employee.leaves.unpaid.used=0;
       employee.markModified("leaves");
       await employee.save();
    }
  }
}
catch(error)
{
  console.log(error);
}
}

cron.schedule('0 0 1 * *', async () => {
  await AddLeavestoEmployee();
});


async function FilterTeamEmployees() {
  try {
      let admin = await TeamTable.find({});
      let employees = admin[0].employees;

      for (let i = employees.length - 1; i >= 0; i--) {
          let employee = await Admin.findById(employees[i]);

          if (!employee) {
              console.log(`Removing employee with ID: ${employees[i]}`);
              employees.splice(i, 1);
          } else {
              console.log(`Employee Display Name: ${employee.displayName}`);
          }
      }

      admin[0].employees = employees;
      admin[0].markModified('employees');
      await admin[0].save();

      console.log('fjj function completed successfully.');
  } catch (error) {
      console.error('Error in fjj function:', error);
  }
}

// async function AddLeavetoEmployee()
// {
// let admin=await Admin.findById('64afa2526daac5948c4a1b80');
// admin.leaves.paid.total=3;
// admin.leaves.paid.used=0;
// admin.leaves.unpaid.total=4;
// admin.leaves.unpaid.used=0;
// admin.markModified('leaves');
// await admin.save(); 
// await Leaves.findOneAndDelete({dates:"2023-11-08 - 2023-11-08",employeeId:'64afa2526daac5948c4a1b80'})
// let performance=await PerformanceRecord.findOneAndUpdate({employeeID:'64afa2526daac5948c4a1b80',date:'2023-11-08'},{onleave:true,leaveType:'paid'});
// console.log(performance);
// }
// AddLeavetoEmployee();


// async function AddLeavetoEmployee()
// {
// let admin=await Admin.findById('647821686f73518f78bc9ed3');
// admin.leaves.paid.total=6;
// admin.leaves.paid.used=0;
// admin.markModified('leaves');
// await admin.save(); 
// }
//  AddLeavetoEmployee();
// async function salaryToEmployee()
// {
//   try{
//   let admins = await Admin.find({});
//   let currentDate = new Date(); // Get the current date
  
//     for (const employee of admins) {
//        employee.salaryHikeMonthly.push({date:currentDate,salary:employee.salary});
//        await employee.save();
//   }
// }
// catch(error)
// {
//   console.log(error);
// }
// }

// salaryToEmployee();

// async function dk()
// {
//   let employee=await Admin.findById('6476f585a45df7fb73a44035');
//   employee.badges+=0.5;
//   await employee.save();
// }
// dk();

module.exports = router;










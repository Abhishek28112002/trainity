const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const axios = require("axios");
const {
  ensureGuest,
  ensureAuth,
  ensureManager,
} = require("../middleware/auth");
const Leaves = mongoose.model("leave");
const AuthorizedAdmin = mongoose.model("authorizedAdmins");
const Admin = mongoose.model("admins");
const PerformanceRecord = mongoose.model("performanceRecords");
const moment = require("moment");
router.get(
  "/leavesAccountability/:employeeId",
  ensureAuth,
  async (req, res) => {
    try {
      let employeeId = req.params.employeeId;
      let employee = await Admin.findById(employeeId);
      if (Object.keys(employee.leaves).length === 0) {
        employee.leaves = {
          paid: { used: 0, total: 2 },
          unpaid: { used: 0, total: 4 },
        };
        employee.save();
      }

      res.locals.employee = employee;
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      let workingdayInYear = await countWorkingDaysInYear();
      let workingdayInMonth = await countWorkingDaysInMonth(
        currentYear,
        currentMonth
      );

      let LeaveHistory = await Leaves.find({ employeeId });
      let totalLeave = 0;
      let leaveInThisMonth = 0;

      LeaveHistory.forEach((leave) => {
        const dateRange = leave.dates.split(" - ");
        const startDate = new Date(dateRange[0]);
        const startMonth = startDate.getMonth();
        if (leave.status == "Accepted") {
          totalLeave += leave.totalDayLeaves;

          if (startMonth === currentMonth) {
            leaveInThisMonth += finddateDiffrence(leave.dates); // Calculate days for this month only
          }
        }
      });
      let WithdrawHistory=[];
      res.locals.WithdrawHistory = WithdrawHistory;
      res.locals.leaveInThisMonth = leaveInThisMonth;
      res.locals.workingdayInYear = workingdayInYear - totalLeave;
      res.locals.TotalworkingdayInMonth =workingdayInMonth;
      res.locals.workingdayInMonth = workingdayInMonth - leaveInThisMonth;
      res.locals.totalLeave = totalLeave;
      res.locals.LeaveHistory = LeaveHistory;

      res.render("leaves-accountability");
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
);

router.get("/leavesAccountabilityManager", async (req, res) => {
  try {
    let user = req.user;
    res.locals.user = user;
    res.locals.manager = user;
    let leaves = await Leaves.find({});
    let admins = await Admin.find({});
//console.log(leaves);
    // Create a mapping of admins using _id as keys
    const adminsMap = admins.reduce((map, admin) => {
      map[admin._id.toString()] = admin;
      return map;
    }, {});

    let pending = [];
    let upcoming = [];
    let current = [];
    const LeaveHistory = leaves.reduce((map, leave) => {
      if (leave.status == "Accepted") {
        if (!map[leave.employeeId]) {
          map[leave.employeeId] = []; // Initialize the array if it doesn't exist
        }
        map[leave.employeeId].push(leave);
      }
      return map;
    }, {});
    
    let WithdrawHistory=[];
    
    res.locals.WithdrawHistory=WithdrawHistory;
    // Categorize leaves into pending, upcoming, and current requests
    const currentDate = new Date();
    leaves.forEach(async (leave) => {
      const startDate = new Date(leave.dates.split(" - ")[0]);
      const endDate = new Date(leave.dates.split(" - ")[1]);
      const today = new Date();

      if (leave.status== "Pending") {
        let totalLeave = 0;

        let leaveInThisMonth = 0;
        let leaveshistory = LeaveHistory[leave.employeeId]? LeaveHistory[leave.employeeId]:[];
         
        leaveshistory.forEach((leaveEmployee) => {
          let leaveStartDate = new Date(leaveEmployee.dates.split(" - ")[0]);
          let startDayOfMonth = leaveStartDate.getDate();
          let startMonth = leaveStartDate.getMonth();
          
          let currentDate = new Date();
          let currentMonth = currentDate.getMonth();
          let currentYear = currentDate.getFullYear();
          let lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
         
          if (
            (startMonth === currentMonth) &&
            leaveEmployee.status == "Accepted"
          ) {
                leaveInThisMonth +=Math.min(leaveEmployee.totalDayLeaves,lastDayOfMonth-startDayOfMonth +1);
                totalLeave+=leaveEmployee.totalDayLeaves;
          }
          else if(leaveEmployee.status == "Accepted"){
            totalLeave+=leaveEmployee.totalDayLeaves;
          }
        });

        pending.push({
          leave,
          admin: adminsMap[leave.employeeId],
          leaveInThisMonth,
          totalLeave,
        });
      } else if (
        leave.status== "Accepted" &&
        today >= startDate &&
        today <= endDate
      ) {
        const daysRemaining = Math.ceil(
          (endDate - today) / (1000 * 60 * 60 * 24)
        );
        current.push({
          leave,
          admin: adminsMap[leave.employeeId],
          daysRemaining,
        });
      } else if (
        leave.status== "Accepted" &&
        startDate > today
      ) {
        const daysRemaining = Math.ceil(
          (startDate - today) / (1000 * 60 * 60 * 24)
        );
        upcoming.push({
          leave,
          admin: adminsMap[leave.employeeId],
          daysRemaining,
        });
      }
    });

    res.locals.LeaveHistory = LeaveHistory;
    res.locals.pending = pending;
    res.locals.current = current;
    res.locals.upcoming = upcoming;

    res.render("leaves-manager");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

router.delete(
  "/leavesAccountability/:leaveId",
  ensureAuth,
  async (req, res) => {
    try {
      let id = req.params.leaveId;
      await UpdateAdminLeave(id, "addleave");
      let response = await Leaves.findById(id);
      if (response.durationType == "Short Leave")
        UpdatePerformanceRecord(response, "removeLeave");
      response = await Leaves.findByIdAndDelete(req.params.leaveId);
      res.send(response);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
);

router.post("/leave/employee", ensureAuth, async (req, res) => {
  try {
    let leave = await Leaves.create(req.body);
    await UpdateAdminLeave(leave._id, "removeleave");
    if (leave.status == "Accepted") {
      UpdatePerformanceRecord(leave, "onLeave");
    }
    res.redirect(`/leavesAccountability/${req.body.employeeId}`);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

router.put("/leave/:leaveId", ensureAuth, async (req, res) => {
  try {
    let response = await Leaves.findByIdAndUpdate(req.params.leaveId, req.body);
    await UpdateAdminLeave(req.params.leaveId, "addleave");
    if (response.status == "Accepted") {
      UpdatePerformanceRecord(response, "onLeave");
    }
    res.status(200).send(response);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// Function to check if a date is a weekend (Saturday or Sunday)

function isWeekend(date) {
  const day = date.getDay(); // Sunday is 0, Saturday is 6
  return day === 0 || day === 6;
}

// Function to count working days in a month

async function countWorkingDaysInMonth(year, month) {
  try {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    let workingDays = 0;

    //const holidays = await fetchHolidays(year); // Fetch holidays for the year

    for (
      let currentDate = startDate;
      currentDate <= endDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      if (!isWeekend(currentDate)) {
        workingDays++;
      }
    }

    return workingDays;
  } catch (error) {
    console.log(error);
  }
}

async function countWorkingDaysInYear() {
  try{
  let workingDays = 0;
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  for (let month = 0; month < 12; month++) {
    workingDays += await countWorkingDaysInMonth(currentYear, month);
  }

  return workingDays;
}
catch(err)
{
  console.log(err);
  res.status(500).send({message:"Something went wrong"});
}
}

// Function to fetch holidays for a given year from Nageru API

async function fetchHolidays(year) {
  const response = await fetch(
    `https://date.nager.at/Api/v2/PublicHolidays/${year}/IND`
  );
  const holidaysData = await response.json();
  return holidaysData.map((holiday) => holiday.date);
}

async function UpdateAdminLeave(leaveId, type) {
  try {
    let leave = await Leaves.findById(leaveId);
    let admin = await Admin.findById(leave.employeeId);
    let paidLeave = 0,
      unpaidLeave = 0,
      badges = 0;
    if (leave.status != "Accepted" || leave.durationType == "Short Leave") {
     
      for (let i = 0; i < leave.leaveType.length; i++) {
        if (leave.leaveType[i].type == "paid")
          paidLeave = leave.leaveType[i].day;
        else if (leave.leaveType[i].type == "unpaid")
          unpaidLeave = leave.leaveType[i].day;
        else {
          badges = leave.leaveType[i].day * 10;
        }
      }
   
      if (type == "addleave") {
       
          admin.leaves.paid.used = Math.max(0, admin.leaves.paid.used - paidLeave);
          admin.leaves.unpaid.used = Math.max(0, admin.leaves.unpaid.used - unpaidLeave);
          admin.usedBadges =parseFloat(Math.max(admin.usedBadges - badges, 0));
      
      } else {
       
          admin.leaves.paid.used = Math.min(admin.leaves.paid.total, admin.leaves.paid.used + paidLeave);
          admin.leaves.unpaid.used = Math.min(admin.leaves.unpaid.total, admin.leaves.unpaid.used + unpaidLeave);
          admin.usedBadges = parseFloat(Math.min(admin.usedBadges + badges, admin.badges));
        
      }
      
     
      admin.markModified("leaves");
      await admin.save();
    }
  } catch (error) {
    console.log(error);
  }
}
async function UpdatePerformanceRecord(leaves, status) {
  try {
    let dates = getWeekdaysInRange(leaves.dates);
    
    let paidLeave = 0,
      unpaidLeave = 0,
      badgesLeave = 0;
    for (const leave of leaves.leaveType) {
      if (leave.type == "paid") {
        paidLeave = leave.day;
      } else if (leave.type == "unpaid") {
        unpaidLeave = leave.day;
      } else {
        badgesLeave = leave.day;
      }
    }
    for (const date of dates) {
      let performanceRecord = await PerformanceRecord.findOne({
        employeeID: leaves.employeeId,
        date,
      });
      if(!performanceRecord)
      {
        performanceRecord= await PerformanceRecord.create({
          employeeID: leaves.employeeId,
          date,
          taskStatus:[false]
        })
      }
      if (status == "onLeave") {
        performanceRecord.onleave = true;
        if (paidLeave > 0) performanceRecord.leaveType = "Paid", paidLeave--;
        else if (badgesLeave > 0)
          performanceRecord.leaveType = "Badges", badgesLeave--;
        else performanceRecord.leaveType = "Unpaid", unpaidLeave--;
      } else {
        performanceRecord.onleave = false;
        performanceRecord.leaveType = "";
      }
      await performanceRecord.save();
    }
  } catch (error) {
    console.log(error);
  }
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWeekdaysInRange(dates) {
  const startDate = new Date(dates.split("-")[0]);
  const endDate = new Date(dates.split("-")[1]);
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

function finddateDiffrence(dateRange) {
  const [startDateStr, endDateStr] = dateRange.split(" - ");

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const lastDayOfMonth = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    0
  ).getDate();
  const effectiveEndDate = new Date(
    Math.min(
      endDate,
      new Date(startDate.getFullYear(), startDate.getMonth(), lastDayOfMonth)
    )
  );

  const timeDifference = Math.abs(effectiveEndDate - startDate);
  const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  let workingDays = 0;
  for (let i = 0; i <= daysDifference; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }
  return workingDays;
}




module.exports = router;

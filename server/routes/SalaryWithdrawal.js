const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const axios = require("axios");
const {
  ensureGuest,
  ensureAuth,
  ensureManager,
} = require("../middleware/auth");
const AuthorizedAdmin = mongoose.model("authorizedAdmins");
const Admin = mongoose.model("admins");
const PerformanceRecord = mongoose.model("performanceRecords");
const salary = mongoose.model("salary");
const moment = require("moment");

router.get("/salary", ensureAuth, async (req, res) => {
  try {
    let employeeId = req.query.id;
    let yearMonth = req.query.yearMonth;
    let employee = await Admin.findById(employeeId);
    res.locals.employee = employee;
    res.locals.user = employee;
    let month, year;
    if (!yearMonth) {
      let d = new Date();
      month = d.getMonth();
      year = d.getFullYear();
      yearMonth = year + "-" + (month + 1);
    } else {
      month = yearMonth.split("-")[1] - 1;
      year = yearMonth.split("-")[0];
    }
    let dateString=moment(yearMonth).format('YYYY-MM');
    res.locals.yearMonth = dateString;
    res.render("salary-withdraw");
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong" });
  }
});

router.get("/salaryManager", ensureAuth,ensureManager, async (req, res) => {
  try {
    let employeeId = req.query.id;
    let yearMonth = req.query.yearMonth;
    let employee = await Admin.findById(employeeId);
    res.locals.employee = employee;
    res.locals.user = employee;
    let month, year;
    if (!yearMonth) {
      let d = new Date();
      month = d.getMonth();
      year = d.getFullYear();
      yearMonth = year + "-" + (month + 1);
    } else {
      month = yearMonth.split("-")[1] - 1;
      year = yearMonth.split("-")[0];
    }
    let dateString=moment(yearMonth).format('YYYY-MM');
    res.locals.yearMonth = dateString;
    res.render("view-salary-withdraw");
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong" });
  }
});

async function f()
{
  await salary.deleteMany({});
}
//f();

router.get("/salaryData", ensureAuth, async (req, res) => {
  try {
    let employeeId = req.query.id;
    let yearMonth = req.query.yearMonth;
    let date = new Date(yearMonth);
    let dateString=moment(date).format('YYYY-MM');
    let employee = await Admin.findById(employeeId);
    let employeeList = await Admin.find({});
    let salaryDetails = await salary.findOne({ employeeId,date:dateString  }); // Fix here
      if(!salaryDetails)
      {
        salaryDetails = await salary.create({
          employeeId:employeeId,
          salary:employee.salary,
          bonus:0,
          date:dateString,
          reasonFBonus:'',
          status:false
        });
      }
    res.status(200).send({
      employee,
      employeeList,
      salaryDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong" });
  }
});

// i have made this api seprate because i want to update employee salary in admin model 
router.post('/save/salary',ensureAuth,ensureManager,async(req,res)=>{
  try {
    let salaryData=req.body;
    let salaryDetails=await salary.findByIdAndUpdate(salaryData._id,salaryData);
    let employee=await Admin.findById(salaryData.employeeId);
    employee.salary=salaryData.salary;
    await employee.save();
    res.send({message:'Salary Saved'});
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong" });
  }
});
router.post('/update/salary',ensureAuth,ensureManager,async(req,res)=>{
  try {
    let salaryData=req.body;
    let salaryDetails=await salary.findByIdAndUpdate(salaryData._id,salaryData);
    res.send({message:'Salary Saved'});
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong" });
  }
});


module.exports = router;

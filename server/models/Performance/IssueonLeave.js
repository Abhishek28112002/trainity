const mongoose = require("mongoose");

const LeaveIssueSchema = new mongoose.Schema({
 employeeId:{
    type:String,
    required:true
 },
 reason:{
    type:String,
    required:true
 },
 date:{
    type:String,
    required:true
 }
 ,
 status:{
   type:String,
   default:'pending'
 }
});

mongoose.model("leaveissue", LeaveIssueSchema);

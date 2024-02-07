const mongoose = require("mongoose");
const LeaveSchema = new mongoose.Schema({
  employeeId:{
    type:String,
    required:true
  },
  durationType:{
    type:String,
    required:true
  },
  dates:{
    type:String,
    required:true
  },
  leaveType:{
    type:Array,
    required:true
  },
  reasonFromEmployee:{
    type:String,
    default:'',
  },
  reasonFromManager:{
    type:String,
    default:'',
  },
  status:{
    type:String,
    default:'Pending',
  },
  managerName:{
    type:String,
    default:'',
  },
  managerImage:{
    type:String,
    default:'',
  },
  totalDayLeaves:{
    type:Number,
    default:0,
  },
  notes:{
    type:String,
    default:''
  }
  ,
  takenByEmployee:{
    type:Boolean,
    default:true
  }

});


mongoose.model("leave", LeaveSchema);

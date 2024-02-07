const mongoose = require("mongoose");
const moment = require('moment');
const SalarySchema = new mongoose.Schema({
  employeeId:{
    type:String,
    required:true
  },
  salary:{
    type:Number,
    default:0,
  },
  bonus:{
    type:Number,
    default:0,
  },
  date:{   // which month salary is this
    type:String,
    default:moment().format('YYYY-MM')
  },
  reasonFBonus:{
    type:String,
    default:''
  },
  status:{  // salary sent or not
    type:Boolean,
    default:false
  }

});


mongoose.model("salary", SalarySchema);

const mongoose = require("mongoose");

const DailyTaskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  taskID: {
    type: Number,
    required: true,
  },
  employeeID: {
    type: String,
    required: true,
  },
  deadline:{
   type:Number,
   default:97200000,
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
});

mongoose.model("dailyTasks", DailyTaskSchema);

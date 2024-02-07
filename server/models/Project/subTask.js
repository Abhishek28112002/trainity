const mongoose = require("mongoose");
const SubTaskSchema = new mongoose.Schema({
  data: {
    type: Object,
    required: true,
  },
  srNo:{
  type:Number,
  default:100,
  },
  submitted: {
    type: Boolean,
    default: false,
  },
  submittedAt: {
    type: Date,
    default: null,
  },
  // InProgressStartedTime: {
  //   // this will help to determin the time spent on the sub task after subtask has set to in progress
  //   type: Date,
  //   default: null,
  // },
  // PervInProgressTime: {
  //   // this will help to determin time spent on sub task before it was set to in progress
  //   type: Number,
  //   default: 0,
  // },
  createAt: {
    type: Date,
    default: Date.now,
  },
});
mongoose.model("milestoneSubTask", SubTaskSchema);

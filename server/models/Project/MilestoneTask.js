const mongoose = require("mongoose");

const MilestoneTaskSchema = new mongoose.Schema({
  data: {
    type: Object,
    required: true,
  },
  submitted: {
    type: Boolean,
    default: false,
  },
  submittedAt: {
    type: Date,
    default: null,
  },
  srNo: {
    type:Number,
    default:100,
  },
  // InProgressStartedTime: {
  //   // this will help to determin the time spent on the task after task has set to in progress
  //   type: Date,
  //   default: null,
  // },
  // PervInProgressTime: {
  //   // this will help to determin time spent on task before it was set to in progress
  //   type: Number,
  //   default: 0,
  // },
  createAt: {
    type: Date,
    default: Date.now,
  },
  posts:{    // track post--> comment---> replies
    type:Array,
    default:[]
  },
  pinnedPost:{  
    type:Array,
    default:[]
  }
});

module.exports = mongoose.model("milestoneTasks", MilestoneTaskSchema);

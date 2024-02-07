const mongoose = require("mongoose");

const ModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  trackID: {
    type: String,
    required: true,
  },
  moduleID: {
    type: Number,
    required: true,
  },
  courseID: {
    type: Number,
    required: true,
  },
  moduleLogo: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  daysToComplete: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
});

mongoose.model("modules", ModuleSchema);

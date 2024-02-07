const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  courseID: {
    type: Number,
    required: true,
  },
  courseLogo: {
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

mongoose.model("courses", CourseSchema);

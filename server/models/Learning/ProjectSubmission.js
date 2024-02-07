const mongoose = require("mongoose");

const ProjectSubmissionSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
  },
  projectID: {
    type: String,
    required: true,
  },
  courseID: {
    type: Number,
    required: true,
  },
  date: {
    type: Number,
    default: Date.now,
  },
  driveLink: {
    type: String,
    required: true,
  },
  videoLink: {
    type: String,
    default: "",
  },
  subID: {
    type: Number,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  feedback: {
    type: Object,
    default: {},
  },
  taskRating: {
    type: Array,
    default: [],
  },
  checkDate: {
    type: Number,
    default: -1,
  },
});

mongoose.model("projectSubmissions", ProjectSubmissionSchema);

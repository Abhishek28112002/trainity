const mongoose = require("mongoose");

const LiveSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subTitle: {
    type: String,
    default: "",
  },
  courseID: {
    type: Number,
    required: true,
  },
  sessionID: {
    type: Number,
    required: true,
  },
  instructorID: {
    type: String,
    default: "",
  },
  sessionDate: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  registrationLink: {
    type: String,
    required: true,
  },
  instructorCardImage: {
    type: String,
    default: "",
  },
  theme: {
    type: Number,
    deafult: 0,
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
});

mongoose.model("liveSessions", LiveSessionSchema);

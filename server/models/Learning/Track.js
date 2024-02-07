const mongoose = require("mongoose");

const TrackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  courseID: {
    type: Number,
    required: true,
  },
  trackLogo: {
    type: String,
    required: true,
  },
  domain: {
    type: String,
    required: true,
  },
  trackID: {
    type: Number,
    required: true,
  },
  topics: {
    type: Array,
    default: [],
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

mongoose.model("tracks", TrackSchema);

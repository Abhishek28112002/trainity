const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  courseID: {
    type: Number,
    required: true,
  },
  projectIcon: {
    type: String,
    required: true,
  },
  deadline: {
    type: Number,
    required: true,
  },
  moduleID: {
    type: String,
    required: true,
  },
  projectID: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: Number,
    reuired: true,
  },
  description: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
  explanationVideo: {
    type: String,
    required: true,
  },
  tasks: {
    type: Array,
    default: [],
  },
  prdLink: {
    type: String,
    required: true,
  },
  judgementCriteria: {
    type: Array,
    default: [],
  },
  relatedLinks: {
    type: Array,
    default: [],
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
});

mongoose.model("projects", ProjectSchema);

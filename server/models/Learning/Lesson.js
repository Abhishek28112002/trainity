const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  moduleID: {
    type: String,
    required: true,
  },
  instructorID: {
    type: String,
    required: true,
  },
  courseID: {
    type: Number,
    default: 101,
  },
  lessonID: {
    type: Number,
    required: true,
  },
  lessonLogo: {
    type: String,
    required: true,
  },
  lessonVideo: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
});

mongoose.model("lessons", LessonSchema);

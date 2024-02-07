const mongoose = require("mongoose");
const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  lessonID: {
    type: String,
    required: true,
  },
  quizID: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  courseID: {
    type: Number,
    required: true,
  },
  estimatedTime: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
});

mongoose.model("quizes", QuizSchema);

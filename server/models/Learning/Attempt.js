const mongoose = require("mongoose");
const QuizAttemptSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
  },
  quizID: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    default: 0,
  },
  result: {
    type: Array,
    default: [],
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
});

mongoose.model("quizAttempts", QuizAttemptSchema);

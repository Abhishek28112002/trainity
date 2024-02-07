const mongoose = require("mongoose");
const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    default: "",
  },
  questionImage: {
    type: String,
    required: true,
  },
  quizID: {
    type: String,
    required: true,
  },
  questionID: {
    type: Number,
    required: true,
  },
  estimatedTime: {
    type: Number,
    required: true,
  },
  options: {
    type: Array,
    default: [],
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
});

mongoose.model("questions", QuestionSchema);

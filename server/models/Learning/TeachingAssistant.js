const mongoose = require("mongoose");

const TeachingAssistantSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    default: "",
  },
  displayName: {
    type: String,
    required: true,
  },
  courseID: {
    type: Number,
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  rating: {
    type: Object,
    default: { value: 5, cnt: 1 },
  },
  image: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
});

mongoose.model("teachingAssistants", TeachingAssistantSchema);

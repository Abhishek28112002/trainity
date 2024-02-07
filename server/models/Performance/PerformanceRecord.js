const mongoose = require("mongoose");

const PerformanceRecordSchema = new mongoose.Schema({
  employeeID: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  dateIST: {
    type: Date,
    default: function () {
      return new Date(this.date);
    },
  },
  rating: {
    type: Number,
    default: 0,
  },
  keyPoints: {
    type: Array,
    default: [],
  },
  ratingList: {
    type: Array,
    default: [0, 0, 0, 0, 0],
  },
  links: {
    type: Array,
    default: ["", "", "", ""],
  },
  submittedAt: {
    type: Array,
    default: ["", "", "", ""],
  },
  feedback: {
    type: String,
    default: "",
  },
  actionable: {
    type: String,
    default: "",
  },
  taskStatus: {
    type: Array,
    default: [false, false, false, false],
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
  badges: {
    type: Number,
    default: 0,
  },
  streakDays: {
    type: Number,
    default: 0,
  },
  perviousDayPopUp: {
    type: Boolean,
    default: false,
  },
  streakPopUp: {
    type: Boolean,
    default: false,
  },
  onleave: {
    type: Boolean,
    default: false,
  },
  leaveType: {
    type: String,
    default: "",
  },
  unratable: {
    type: Boolean,
    default: false,
  },
});

mongoose.model("performanceRecords", PerformanceRecordSchema);

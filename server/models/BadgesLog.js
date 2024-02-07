const mongoose = require("mongoose");
const BagdesLogSchema = mongoose.Schema({
  badges: {
    type: Number,
    required: true,
  },
  employeeId: {
    type: String,
    required: true,
  },
  allotmentId: {
    type: String,
    default: "",
  },
  date: {
    type: Date,
  },
  title: {
    type: String,
    default: "Daily Loom",
  },
  description: {
    type: String,
    default: "",
  },
  allotedDate: {
    type: Date,
    default: Date.now,
  },
});
exports.BadgesLog = mongoose.model("badgesLog", BagdesLogSchema);

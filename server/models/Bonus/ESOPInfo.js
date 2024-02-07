const mongoose = require("mongoose");

const ESOPInfoSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },
  units: {
    type: Number,
    default: 0,
  },
  allotedOn: {
    type: Number,
    required: true,
  },
  vestingPeriod: {
    type: Number,
    default: 4,
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
});

mongoose.model("esopInfos", ESOPInfoSchema);

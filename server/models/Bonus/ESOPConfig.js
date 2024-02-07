const mongoose = require("mongoose");

const ESOPConfigSchema = new mongoose.Schema({
  unitValue: {
    type: Number,
    default: 0,
  },
  updatedOn: {
    type: Number,
    default: Date.now(),
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
});

mongoose.model("esopConfigs", ESOPConfigSchema);

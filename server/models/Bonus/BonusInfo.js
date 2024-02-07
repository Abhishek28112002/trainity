const mongoose = require("mongoose");

const BonusInfoSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    default: 0,
  },
  vestingStartDate:{
   type: Date,
  },
  distributionType: {
    type: String,
    default: "custome",
  },
  monthlyDistribution: {
    type:Array,
    default: [],
  },
  vestingPeriod: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
});

mongoose.model("bonusInfos", BonusInfoSchema);

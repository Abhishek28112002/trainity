const mongoose = require("mongoose");

const UserLearningInfoSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
  },
  completedQuizes: {
    type: Array,
    defualt: [],
  },
});

mongoose.model("userLearningInfos", UserLearningInfoSchema);

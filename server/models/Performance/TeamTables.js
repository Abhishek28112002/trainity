const mongoose = require("mongoose");

const TeamTableSchema = new mongoose.Schema({
  srNo: {
    type: Number,
    default: 0,
  },
  title: {
    type: String,
  },
  employees: {
    type: Array,
    default: [],
  },
});
mongoose.model("TeamTable", TeamTableSchema);

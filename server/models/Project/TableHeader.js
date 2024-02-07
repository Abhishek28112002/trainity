let mongoose = require("mongoose");

let TableHeaderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  labels: {
    type: Array,
    default: [],
  },
  usedName: {
    type: String,
    required: true,
  },
  srNo: {
    type: Number,
    required: true,
  },
  style: {
    type: String,
    default:
      "width: 110px;display:flex;align-items: center;justify-content: center;",
  },
});
module.exports = mongoose.model("tableHeaders", TableHeaderSchema);

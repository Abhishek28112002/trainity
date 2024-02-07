const mongoose = require("mongoose");
const RatingReviewSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "",
  },
  dateIST:{
type:Date,
default: function () {
  return new Date(this.date);
},
  },
  originalRating: {
    type: Array,
    default: [],
  },
  selfRating: {
    type: Array,
    default: [],
  },
  updatedRating: {
    type: Array,
    default: [],
  },
  requestApproved: {
    type: Boolean,
    default: false,
  },
  justificationFromManager: { type: String, default: "" },
  justificationFromEmployee: { type: String, default: "" },
  feedbackEmployee: { type: String, default: "" },
  isSatisfied: { type: String, default: "" },
});
mongoose.model("ratingReview", RatingReviewSchema);

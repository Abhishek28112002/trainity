const mongoose = require("mongoose");
const AuthorizedAdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  team:{
    type:String,
    default:""
  },
  position: {
    type: Number,
    required: true, // 0 -> Manager, 1-> Employee
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
  employmentType: {
    type: String,
    required: true,
    default: "Full Time", // Full Time, Intern, Part Time
  },

});

mongoose.model("authorizedAdmins", AuthorizedAdminSchema);

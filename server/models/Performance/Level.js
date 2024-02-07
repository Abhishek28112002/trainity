const mongoose = require("mongoose");

const LevelSchema = new mongoose.Schema({
  employeeID: {
    type: String,
    required: true,
  },
  badges: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
  progress20:{
    type:Boolean,
    default: false,
  },
  progress50:{
    type:Boolean,
    default: false,
  },
  progress70:{
    type:Boolean,
    default: false,
  },
  progress100:{
    type:Boolean,
    default: false,
  }
});

mongoose.model("levels", LevelSchema);

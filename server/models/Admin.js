const mongoose = require("mongoose");
const moment = require('moment');
const AdminSchema = new mongoose.Schema({
  googleID: {
    type: String,
    require: true,
  },
  displayName: {
    type: String,
    require: true,
  },
  firstName: {
    type: String,
    required: [true, "Please enter your name"],
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Please enter an email"],
    lowercase: true,
    unique: true,
    trim: true,
  },
  birthdate: {
    type: String,
  },
  phone: {
    type: String,
    default: "+91 1234567890",
  },
  gender: {
    type: String,
  },
  image: {
    type: String,
    default: "../../img/custom/Robot_Avatar.jpg",
  },
  managerID: {
    type: Array, 
    default: [],
  },
  position: {
    type: Number,
    required: true,
  },
  badges: {
    type: Number,
    default: 0,
  },
  badgeswtp:{ // badges without project
    type:Number,
    default:0,
  },
  projectbadges:{
    type:Array,
    default:[]
  },
  usedBadges:{
    type:Number,
    default:0
  },
  team:{
    type:String,
    default:""
  },
  rating: {
    type: Object,
    default: { value: 0, cnt: 0 },
  },
  recent:{
    type:Object,
    default:{badges:0,rating:0,date:''}
  },
  createdAt: {
    type: Number,
    default: Date.now,
  },
  salary:{
    type:Number,
    default: 0,
  },
  leaves:{
    type:Object,
    default:{}
  },
  joiningDate:{
    type:Date,
    default: moment().format('YYYY-MM-DD')
  },
  leave_announcement:{
    type:Boolean,
    default: true
  },
  currentLevel:{
    type:Number,
    default:1
  },
  performanceScoreList:{  // it will contain the performance score of the employee for each month
   type:Map,
   default:new Map()
  },
  performanceScore:{
    type:Number,
    default:0
  },
  performanceTypeForFutureMonths:{
  type:Boolean,
  default:false
  },
  employmentType: {
    type: String,
    required: true,
    default: "Full Time", // Full Time, Intern, Part Time
  },
});

mongoose.model("admins", AdminSchema);

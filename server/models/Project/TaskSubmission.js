let mongoose = require("mongoose");
let TaskSubmissionSchema = new mongoose.Schema({
  taskId: {
    type:String,
    default:''
  },
  tasktitle:{
    type:String,
    required:true
  },
  from:{
    type: Object,
    required: true,
  },
  project: {
    type: Object,
  },
  krs: {
    type: Array,
    default:[]
  },
  subkrs: {
    type: Array,
    default:[]
  },
  pervKpiProgress: {
    type: Array,
    default: {},
  },
  KpiProgress: {
    type: Object,
    default: {},
  },
  quality: {
    type: Number,
    default: 0,
  },
  speed: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  expectedBadges: {
    type: Number,
    default: 0,
  },
  badges: {
    type: Number,
    default: 0,
  },
  feedback: {
    type: Array,
    default: [],
  },
  status: {
    type: String,
    default: "Pending",
  },
  submittedOn: {
    type: Date,
    default: Date.now(),
  },
  links:{
    type:Array,
    default:[]
  },
  files:{
    type:Array,
    default:[]
  },
  reason:{  // reason for rejection of task submission
    type:String,
    default:''
  },
  startDate:{
    type:String,
    default:''
  },
  endDate:{
    type:String,
    default:''
  },
  description:{
    type:String,
    default:''
  },
  businessOutcome:{
    type:String,
    default:''
  },
  learning:{
    type:String,
    default:''
  },
  nextStep:{
    type:String,
    default:''
  },
  initialInfo:{
    type:String,
    default:''
  },
  metricMoved:{
   type:Boolean,
   default:false
  },
  liveStatus:{
    type:Object,
    default:{},
  },
  inUsageStatus:{
    type:Object,
    default:{},
  },
  valueGenerated:{
    type:Object,
    default:{},
  },
  bImpact:{
    type:Object,
    default:{},
  },
  userAdoption:{
    type:Object,
    default:{},
  },
  OutcomeStatus:{
type:String,
default:"",
  },
  effortStatus:{
  type:Object,
  default:{},
  },
  customerSatisfaction:{
    type:Object,
    default:{},
  },
  metricMovedDescription:{
    type:String,
    default:''
  }
});
mongoose.model("TaskSubmission", TaskSubmissionSchema);

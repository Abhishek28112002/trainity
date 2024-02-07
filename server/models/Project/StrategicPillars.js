const mongoose = require('mongoose')
const StrategicPillarsSchema = new mongoose.Schema({
  CompanyId:{
        type:String,
        required:true,
    },
    description: {
      type: String,
      default: ""
    },
    title:{
      type: String,
      default: ""
    },
   progress: {
    type: String,
    default:0  
   },
   objectives:{
    type:Number,
    default:0
   },
   projects:{
    type:Number,
    default:0
   },
   tasks:{
    type:Number,
    default:0
   },
   initiatives:{
    type:Number,
    default:0
   },
   members:{
    type:Array,
    default:[]
   }
  });
  
  mongoose.model("StrategicPillars", StrategicPillarsSchema);
  
  
const mongoose = require("mongoose");
const PerformanceScoreSchema = new mongoose.Schema({
    employeeId:{
        type:String,
        required:true
    },
    monthYear:{
        type:String,
        required:true
    },
    score:{
        type:Number,
        default:0
    },
    performanceMatrix:{  //['AvgRating','BadgesThroughLooms','AvgTaskSpeed','AvgTaskQuality','TaskBadges','leaves','loomsMissed']
        type:Array,
        default:[]
    },
    MatrixWeightage:{  //['AvgRating','BadgesThroughLooms','AvgTaskSpeed','AvgTaskQuality','TaskBadges','leaves','loomsMissed']
        type:Array,
        default:[30,20,15,15,20,-3,-1]
    },
    level:{
        type:Object,
        default:{}
    },
    performanceCalculateType:{
        type:String,
        default:'Automatic'
    }
})
mongoose.model("PerformanceScore", PerformanceScoreSchema);
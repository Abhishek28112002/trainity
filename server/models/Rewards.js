const mongoose = require('mongoose')
const RewardSchema = new mongoose.Schema({
   employeeId:{
    type:String,
    required:true,
   },
   title:{
    type:String,
   },
   badges:{
    type:Number,
   },
   link:{
    type:String,
   },
   image:{
    type:String
   },
   price:{
    type:String
   },
   status:{
type:String
   }
})

mongoose.model("rewards", RewardSchema);
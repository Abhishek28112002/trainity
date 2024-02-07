const mongoose = require('mongoose')
const CompanySchema = new mongoose.Schema({
    title:{
        type: String,
    },
    srNo:{
        type: Number,
        default:0
    },
    createdAt:{
        type: Date,
        default: Date.now()
    }
  });
  
  mongoose.model("CompanySchema", CompanySchema);
  
  
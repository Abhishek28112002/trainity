const mongoose = require('mongoose')
const MilestoneTechSkillSchema = new mongoose.Schema({
    projectId:{
        type:String,
        required: true,
    },
    contents: {
      type: Array,
      required: [],
    },
  });
  
  mongoose.model("milestoneTechSkill", MilestoneTechSkillSchema);
  
  
const mongoose = require("mongoose");

const MilestoneProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  ResultFile:{
    type:Object,
    default:{}
  },
  progress:{
    type:Number,
    default:0
  },
  objectiveId:{
    type:String,
    required:true
  },
  description:{
    type: String,
  },
  krs:{
    type: Array,
    default:[]
  },
  startDate:{
    type:String,
    required:true
  },
  endDate:{
    type:String,
    required:true
  },
  owners:{
    type: Array,
    default:[]
  },
  teams:{
    type:Array,
    default:[]
  },
  pinnedBy:{
    type: Array,
    default: [],
  },
  links:{
    type:Array,
    default:[]
  },
  PRD:{
    type:String,
    default:""
  },
  Parameters:{
    type:String,
    default:""
  },
  files:{
    type:Array,
    default:[]
  },
  createdAt: {
    type: Number,
    default: Date.now(),
  },
  phases:{
    type:Array,
    default:[{title:'Initiation',completed:false,date:''},{title:'Execution',completed:false,date:''},
    {title:'Closure',completed:false,date:''},{title:'Evalution',completed:false,date:''},{title:'Impact Assessment',completed:false,date:''},
    {title:'Next Steps',completed:false,date:''},{title:'Iteration for Improvement',completed:false,date:''}
  ]
  },
  comments:{
    type:Array,
    default:[]
  },
  roadmap:{
      type:Array,
      default:[]
  }
});

mongoose.model("milestoneProjects", MilestoneProjectSchema);




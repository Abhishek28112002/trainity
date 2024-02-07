const mongoose=require('mongoose')
const ObjectivesSchema=new mongoose.Schema({
    StrategicPillarsId:{
        type:String,
        required:true,
    },
    title: {
      type: String,
    },
    progress:{
        type: Number,
        default:0
    },
    status:{
        type:String,
        default:'On Track'
    },
    owner:{
        type:Array,
        default:[]
    },
    teams:{
        type:Array,
        default:[]
    },
    PRD:{
        type:String,
        default:''
    },
    matrix:{
        type:Object,
        default:{}
    },
    timePeriod:{
        type:Object,
        default:{}
    },
    efforts:{
        type:String,
        default:''
    },
    finalResult:{
        type:String,
        default:''
    },
    parameters:{
        type:String,
        default:''
    },
    comments:{
        type:Array,
        default:[]
    },
    files:{
        type:Array,
        default:[]
    }
    ,links:{
        type:Array,
        default:[]
    },
    roadmap:{
        type:Array,
        default:[]
    },
    projects:{
        type:Number,
        default:0
    },
    tasks:{
        type:Number,
        default:0
    }
})
mongoose.model("Objectives",ObjectivesSchema)
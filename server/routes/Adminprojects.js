const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const {
  ensureGuest,
  ensureAuth,
  ensureManager,
} = require("../middleware/auth");
const TableHeader = require("../models/Project/TableHeader");
const { PI } = require("aws-sdk");
const Admin = mongoose.model("admins");
const KR = mongoose.model("milestoneKR");
const Projects = mongoose.model("milestoneProjects");
const Tasks = mongoose.model("milestoneTasks");
const Company = mongoose.model("CompanySchema");
const StrategicPillar = mongoose.model("StrategicPillars");
const Objectives = mongoose.model("Objectives");
const TeamTable = mongoose.model("TeamTable");
const SubKR = mongoose.model("milestoneSubKR");
const Initiatives = mongoose.model("milestoneInitiatives");
const SubTask = mongoose.model("milestoneSubTask");
const TaskSubmission = mongoose.model("TaskSubmission");
const BadgesLog = mongoose.model("badgesLog");
const moment = require("moment");

async function fX() {
  try {
  //  let x=await TableHeader.find({});
  //  console.log(x)
    // let projects=await Projects.find({});
   
    // let ids=['6566ca87a9abdaaa14bcc7bd','6567725a235c19721324470f']
    // for(let id of ids){
    // let object=await Projects.findByIdAndDelete(id);
    // }
    // await Objectives.deleteMany({});
    // await KR.deleteMany({});
    // await SubKR.deleteMany({});
    // await Initiatives.deleteMany({});
    // await Tasks.deleteMany({});
    // await SubTask.deleteMany({});
    //await TaskSubmission.deleteMany({});
  //  await StrategicPillar.deleteMany({});
  //  await Company.deleteMany({});
  // let tasks=await SubTask.find({});
  // for(let task of tasks)
  // {
  //   if(task.data.Status=="Upcoming")
  //   {
  //     task.InProgressStartedTime=new Date(task.data.AllotmentDate);
  //     task.PervInProgressTime=0;
  //     console.log(task.data.AllotmentDate)
  //     await task.save();
  //   }
  // }
  await TableHeader.findOneAndUpdate({title:"Progress",category:'ProjectTaskPageTasks'},{title:'Time elapsed'});
  } catch (error) {
    console.log(error);
  }
}
//fX()
router.get('/getTaskSubmissions/:id',async (req, res) => {
  try{
  let employeeId=req.params.id;
  let submissions=await TaskSubmission.find({"from.id":employeeId});
 
  res.status(200).send({TaskSubmissions:submissions});
}
catch (error) {
  console.error(error);
  res.status(500).send({ status: 500, message: "Server Error" });
}
});
router.get('/getDataCP',async (req, res) => {
  try{
  let companies = await Company.find({});
  let sortedCompanies = companies.sort((a, b) => {
    return a.srNo - b.srNo;
  });
  companies = sortedCompanies;
  let AllPilers = await StrategicPillar.find({});

  let Pillers = [];

  for (let i = 0; i < sortedCompanies.length; i++) {
    Pillers.push([]);

    AllPilers.forEach((pillar) => {
      const companyId = pillar.CompanyId;
      if (companyId == sortedCompanies[i]._id) Pillers[i].push(pillar);
    });

  }
  res.status(200).send({ companies, Pillers });
}
catch (error) {
  console.error(error);
  res.status(500).send({ status: 500, message: "Server Error" });
}
});

router.post('/update/taskOrder',ensureAuth,ensureManager,async (req, res) => {
  try{
    let tasks = req.body;
    for(let task of tasks)
    {
   let x = await Tasks.findByIdAndUpdate(task.id,{srNo:task.srNo});
    }
  res.status(200).send({ status: 200, message: "Task Order Updated" });
}
catch (error) {
  console.error(error);
  res.status(500).send({ status: 500, message: "Server Error" });
}
})
router.post('/update/subtaskOrder',ensureAuth,ensureManager,async (req, res) => {
  try{
    let subtasks = req.body;
    for(let subtask of subtasks)
    {
   let x = await SubTask.findByIdAndUpdate(subtask.id,{srNo:subtask.srNo});
    }
  res.status(200).send({ status: 200, message: "Sub Task Order Updated" });
}
catch (error) {
  console.error(error);
  res.status(500).send({ status: 500, message: "Server Error" });
}
})

router.post('/allotBadges',async (req, res) => {
  try {
    const data = req.body;
   
    const date = moment().format('YYYY-MM-DD');

    const owner = await Admin.findById(data.owner.id);

    if (!owner) {
      return res.status(404).send({ status: 404, message: 'Owner not found' });
    }

    owner.badges += data.newBadges - data.perv;
    await owner.save();

    let badgelog = await BadgesLog.findOne({ allotmentId: data.submissionId });

    if (badgelog) {
      badgelog = await BadgesLog.findOneAndUpdate(
        { allotmentId: data.submissionId },
        {
          employeeId: data.owner.id,
          date,
          badges: data.newBadges,
          allotmentId: data.submissionId,
          title: 'Task Submission',
          description: `${data.tasktitle} submitted`,
          createAt: new Date(),
          allotedDate:new Date()
        },
        { new: true }
      );
    } else {
      badgelog = await BadgesLog.create({
        employeeId: data.owner.id,
        date,
        badges: data.newBadges,
        allotmentId: data.submissionId,
        title: 'Task Submission',
        description: `${data.tasktitle} submitted`,
        allotedDate:new Date()
      });
    }
    console.log(badgelog);
    //  let yearmonth=moment(date).format("YYYY-MM");
    //  SetPerformancesScore(yearmonth,data.owner.id);
     res.status(200).send(badgelog);
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: 500, message: "Server Error" });
  }
});
router.get('/taskdata', ensureAuth, async (req, res) => {
  try {
   
    const projects = await Projects.find({});
     let id=req.query.id;
     let tasks=[];
     let TaskSubmissions=[]
    if(id=="all")
  { tasks = await Tasks.find({ });
  let nonSubmittedTasks= tasks.filter((task) => !task.submitted);
   tasks=nonSubmittedTasks;
  tasks.sort((a, b) => {
    return new Date(b.createAt).getTime() - new Date(a.createAt).getTime();
  });
  tasks.sort((a, b) => {
    return a.srNo - b.srNo;
  }); 
  TaskSubmissions = await TaskSubmission.find({})
}
else
  { tasks = await Tasks.find({ "data.Owner.id": id.toString() });
  let nonSubmittedTasks= tasks.filter((task) => !task.submitted);
   tasks=nonSubmittedTasks;
  TaskSubmissions = await TaskSubmission.find({"from.id":id})
}
tasks.sort((a,b)=>{
  return a.srNo-b.srNo;
})
   
let subTasks = await SubTask.find({});

    let subtaskMap = new Map();
    for (let task of tasks) {
      subtaskMap.set(task._id.toString(), []);
    }
    for (let subtask of subTasks) {
      let task = subtaskMap.get(subtask.data.taskId.toString());
      if (task) {
        task.push(subtask);
        subtaskMap.set(subtask.data.taskId.toString(), task);
      }
    }
    let subtasks = [];
    for (let task of tasks) {
      subtasks.push(subtaskMap.get(task._id.toString()) || []);
    }
    let subTaskHeader=await TableHeader.find({category: 'ProjectSubTaskPageTasks'})
    subTaskHeader.sort((a,b) =>{
    return a.srNo - b.srNo;
    })
    let projectMap = new Map();
    for (let project of projects) {
      if (project.objectiveId) {
        let list = projectMap.get(project.objectiveId) || [];
        list.push({ id: project._id.toString(), title: project.title });
        projectMap.set(project.objectiveId, list);
      }
    }
    
    // TaskSubmissions.sort((a,b)=>{

    //   if (a.status === 'Pending' && b.status !== 'Approved') {
    //     return -1; // a comes first because it's pending
    //   } else if (a.status !== 'Approved' && b.status === 'Pending') {
    //     return 1; // b comes first because it's pending
    //   } else {
    //     // Keep the original order if both have the same status or both are not pending
    //     return 0;
    //   }
    // })
    
    let employees = await Admin.find({});
   
   
    let OKRs = await Objectives.find({});

    let okrsMap = new Map();
    for (let okr of OKRs) {
      let lists = okrsMap.get(okr.StrategicPillarsId.toString()) || [];
      lists.push(okr);
      okrsMap.set(okr.StrategicPillarsId.toString(), lists);
    }
    let kr = await KR.find({});
    let krsMap = new Map();
    for (let krs of kr) {
      let lists = krsMap.get(krs.objectiveId.toString()) || [];
      lists.push(krs);
      krsMap.set(krs.objectiveId.toString(), lists);
    }

    let subkrlist = await SubKR.find({});

    let subkrmap = new Map();
    for (let subkr of subkrlist) {
      let lists = subkrmap.get(subkr.keyResultId.toString()) || [];
      lists.push(subkr);
      subkrmap.set(subkr.keyResultId.toString(), lists);
    }
    subtasks.forEach((subtask)=>{
      subtask.sort((a, b) =>{
        return a.srNo - b.srNo;
      })
    })
    console.log("hihihi")
    res.status(200).send({TaskSubmissions,initiative:tasks,subtasks,subkrs:Array.from(subkrmap),krs:Array.from(krsMap),OKRs:Array.from(okrsMap),employees,projects:Array.from(projectMap),subTaskHeader});
  }
  catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server Error" });
  }
})

router.delete("/delete/tasksubtask", async (req, res) => {
  try {
    const projectId = req.body.projectId;

    if (projectId) {
      await Tasks.deleteMany({ "data.projectId": projectId });

      await SubTask.deleteMany({ "data.projectId": projectId });

      res
        .status(200)
        .send({
          status: 200,
          message: "Tasks and subtasks deleted successfully",
        });
    } else {
      res.status(400).send({ status: 400, message: "Project ID is required" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: 500, message: "Server Error" });
  }
});
router.post("/create/subtask", async (req, res) => {
  try {
    let id = req.body._id;

    let subtask;
    if (id) {
      subtask = await SubTask.findByIdAndUpdate(id, req.body);
    } else subtask = await SubTask.create(req.body);
    res.status(200).send(subtask);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});

router.post("/create/initiatives", async (req, res) => {
  try {
    let id = req.body._id;
    let initiative;
    if (id) {
      initiative = await Initiatives.findByIdAndUpdate(id, req.body);
    } else initiative = await Initiatives.create(req.body);
    res.status(200).send(initiative);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});

router.post("/create/keyresult", async (req, res) => {
  try {
    let id = req.body._id;
    let keyresult;
    if (id) {
      keyresult = await KR.findByIdAndUpdate(id, req.body);
    } else keyresult = await KR.create(req.body);
    res.status(200).send(keyresult);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});
router.delete("/create/keyresult", async (req, res) => {
  try {
    let id = req.body._id;

    if (id) {
      await KR.findByIdAndDelete(id);
    }
    res.status(200).send({ status: 200, message: "keyresult Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});

router.post("/create/subkeyresult", async (req, res) => {
  try {
    let id = req.body._id;
    let subkeyresult;
    if (id) {
      subkeyresult = await SubKR.findByIdAndUpdate(id, req.body);
    } else subkeyresult = await SubKR.create(req.body);
    res.status(200).send(subkeyresult);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});
router.delete("/create/subkeyresult", async (req, res) => {
  try {
    let id = req.body._id;

    if (id) {
      await SubKR.findByIdAndDelete(id);
    }
    res.status(200).send({ status: 200, message: "Subkeyresult Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});

router.post("/create/objective", async (req, res) => {
  try {
    let id = req.body._id;
    let objective;
    if (id) {
      objective = await Objectives.findByIdAndUpdate(id, req.body);
    } else {
      objective = await Objectives.create(req.body);
    }
    res.status(200).send(objective);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});
router.delete("/create/objective", async (req, res) => {
  try {
    let id = req.body._id;

    if (id) {
      await Objectives.findByIdAndDelete(id);
    }
    res.status(200).send({ status: 200, message: "Objective Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});

router.get("/okr", async (req, res) => {
  try {
    let id = req.query.id;
    let user = req.user;
    res.locals.user = user;
    let okr = await Objectives.findById(id);
    let employees = await Admin.find({});
    let teams = await TeamTable.find({});
    res.locals.teams = teams;
    res.locals.employeeList = employees;
    res.locals.okr = okr;
    let kr = await KR.find({ objectiveId: id });
    res.locals.kr = kr;
    let subkrlist = await SubKR.find({});
    let subkrs = [];

    let subkrmap = new Map();
    for (let i = 0; i < kr.length; i++) {
      subkrmap.set(kr[i]._id.toString(), []);
    }

    for (let subkr of subkrlist) {
      let lists = subkrmap.get(subkr.keyResultId) || [];
      lists.push(subkr);
      subkrmap.set(subkr.keyResultId, lists);
    }
    for (let i = 0; i < kr.length; i++) {
      subkrs.push(subkrmap.get(kr[i]._id.toString()));
    }

    res.locals.subkrs = subkrs;
    res.render("Objectives");
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});

router.get("/kr", async (req, res) => {
  try {
    let id = req.query.id.toString();
    let okrid = req.query.okrid.toString();

    let user = req.user;
    res.locals.user = user;
    let kr = await KR.findById(id);
    let employees = await Admin.find({});
    let teams = await TeamTable.find({});
    res.locals.teams = teams;
    res.locals.employeeList = employees;
    let subkrs = await SubKR.find({ keyResultId: id });
    res.locals.subkr = subkrs;
    res.locals.kr = kr;
    let initiatives = [];
    let initiativeMap = new Map();
    for (let i = 0; i < subkrs.length; i++) initiatives.push([]);
    let initiativesList = await Initiatives.find({});
    for (let initiative of initiativesList) {
      let lists = initiativeMap.get(initiative.subkeyResultId) || [];
      lists.push(initiative);
      initiativeMap.set(initiative.subkeyResultId, lists);
    }
    for (let i = 0; i < subkrs.length; i++) {
      initiatives[i] = initiativeMap.get(subkrs[i]._id.toString()) || [];
    }

    res.locals.initiatives = initiatives;
    let okr = await Objectives.findById(okrid);
    res.locals.okrid = okrid;
    res.locals.okrtitle = okr.title;
    res.render("Kr");
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});
router.get('/projectbyObj/:objectiveId',async (req, res) => {
  try{
    let project=await Projects.find({objectiveId:req.params.objectiveId});
    res.send(project);
   
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
  
})
router.get("/subkr", async (req, res) => {
  try {
    let id = req.query.id;
    let okrid = req.query.okrid;
    let krid = req.query.krid;
    res.locals.krid=krid
    let okr = await Objectives.findById(okrid);
    res.locals.okrid = okrid;
    res.locals.okrtitle = okr.title;
    let user = req.user;
    res.locals.user = user;

    let kr = await KR.findById(krid);
    let employees = await Admin.find({});
    let teams = await TeamTable.find({});
    res.locals.teams = teams;
    res.locals.employeeList = employees;
    let subkr = await SubKR.findById(id);
    res.locals.subkr = subkr;
    res.locals.krtitle = kr.title;
    let TaskTableHeaders = await TableHeader.find({
      category: "ProjectTaskPageTasks",
    });
    TaskTableHeaders.sort((a, b) => {
      return a.srNo - b.srNo;
    });
    res.locals.TaskTableHeaders = TaskTableHeaders;
    const tasks = await Tasks.find({});
    let nonSubmittedTasks= tasks.filter((task) => !task.submitted);
   tasks=nonSubmittedTasks;
    tasks.sort((a, b) => {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }); 
    tasks.sort((a, b) => {
      return a.srNo - b.srNo;
    }); 
     kr = await KR.find({});
    let krsMap = new Map();
    for (let krs of kr) {
      let lists = krsMap.get(krs.objectiveId.toString()) || [];
      lists.push(krs);
      krsMap.set(krs.objectiveId.toString(), lists);
    }

    let subkrlist = await SubKR.find({});

    let subkrmap = new Map();
    for (let subkr of subkrlist) {
      let lists = subkrmap.get(subkr.keyResultId.toString()) || [];
      lists.push(subkr);
      subkrmap.set(subkr.keyResultId.toString(), lists);
    }
    
    res.locals.subkrsmap = Array.from(subkrmap.entries());
    res.locals.krsmap = Array.from(krsMap.entries());
    
   
    
    tasks.some((task) => {
      return task.data.subkrs.find((subkr) => subkr.id === id);
    });
    let subTasksList = await SubTask.find({});
   
    let subTasksMap = new Map();
    let subTasks = [];
    for (let subTask of subTasksList) {
      let list = subTasksMap.get(subTask.data.taskId) || [];
      list.push(subTask);
      subTasksMap.set(subTask.data.taskId, list);
    }
    for (let initiative of tasks) {
      let list = subTasksMap.get(initiative._id.toString()) || [];
      subTasks.push(list);
    }
    let subTaskHeader=await TableHeader.find({category: 'ProjectSubTaskPageTasks'})
    subTaskHeader.sort((a,b) =>{
    return a.srNo - b.srNo;
    })
    res.locals.subTaskHeader = subTaskHeader
    subTasks.forEach((subtask)=>{
      subtask.sort((a, b) =>{
        return a.srNo - b.srNo;
      })
    })
    res.locals.subTasks = subTasks;

    res.locals.initiative = tasks;
    res.render("SubKr");
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});
router.post("/create/strategicPillar", async (req, res) => {
  try {
    let id = req.body._id;
    let response;
    if (id) {
      response = await StrategicPillar.findByIdAndUpdate(id, req.body);
    } else {
      response = await StrategicPillar.create(req.body);
    }
    res.status(200).send(response);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});
router.delete("/create/strategicPillar", async (req, res) => {
  try {
    let id = req.body._id;
    if (id) {
      let res = await StrategicPillar.findByIdAndDelete(id);
    }

    res.status(200).send({ status: 200, message: "StrategicPillar Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});
router.put("/create/strategicPillar", async (req, res) => {
  try {
    let id = req.body._id;
    if (id) {
      let res = await StrategicPillar.findByIdAndUpdate(id, req.body);
    } else {
      let res = await StrategicPillar.create(req.body);
    }
    res.status(200).send({ status: 200, message: "StrategicPillar Created" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});

router.post("/create/company", async (req, res) => {
  try {
    
    let company = await Company.findOne({ title: req.body.title });
    if (!company) {
      company = await Company.create(req.body);
    } else {
      company = await Company.findOneAndUpdate(
        { title: req.body.title },
        req.body
      );
    }
   
    res.status(200).send(company);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});
router.put("/create/company", async (req, res) => {
  try {
    let company = await Company.findOne({ title: req.body.title });
    if (!company) {
      company = await Company.create(req.body);
    } else {
      company = await Company.findOneAndUpdate(
        { title: req.body.title },
        req.body
      );
    }
    res.status(200).send({ status: 200, message: "Company Created" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});

router.post("/update/companyOrder", async (req, res) => {
  try {
    let companyList = req.body.CompanyList;
    for (let i = 0; i < companyList.length; i++) {
      let company = await Company.findOneAndUpdate(
        { title: companyList[i].title },
        { srNo: i }
      );
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});
router.post("/update/companyName", async (req, res) => {
  try {
    let { perv_name, new_name } = req.body;
    let company = await Company.findOneAndUpdate(
      { title: perv_name },
      { title: new_name }
    );
    res.status(200).send({ status: 200, message: "Company Updated" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});
router.delete("/delete/company", async (req, res) => {
  try {
    let { id } = req.body;
    let company = await Company.findByIdAndDelete(id);
    let pillars=await StrategicPillar.find({ CompanyId: company._id.toString()});
    await StrategicPillar.deleteMany({ CompanyId: company._id.toString()});
    for(let pillar of pillars||[])
    {
      let objectives=await Objectives.find({ StrategicPillarsId: pillar._id.toString()});
      await Objectives.deleteMany({ StrategicPillarsId: pillar._id.toString()});
      for(let objective of objectives||[])
      {
        let krs=await KR.find({ objectiveId: objective._id.toString()});
        await KR.deleteMany({ objectiveId: objective._id.toString()});
        for(let kr of krs||[])
        {
          let subkrs=await SubKR.find({ keyResultId: kr._id.toString()});
          await SubKR.deleteMany({ keyResultId: kr._id.toString()});
          for(let subkr of subkrs||[])
          {
            let initiatives=await Tasks.find({ 'data.ObjectiveId': objective._id.toString()});
          await Tasks.deleteMany({ 'data.ObjectiveId': objective._id.toString()});
            for(let initiative of initiatives||[])
            {
              let subtasks=await SubTask.find({ 'data.taskId': initiative._id.toString()});
              await SubTask.deleteMany({ 'data.taskId': initiative._id.toString()});
            }
          }
        }
      }
    }
    res.status(200).send({ status: 200, message: "Company Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});

// For Creating new projects
router.get("/create/project", ensureAuth, async (req, res) => {
  try {
    const employeeList = await Admin.find({});
    res.locals.employeeList = employeeList;
    res.render("add-project");
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});
function generateRandomId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}
async function f() {
  const columnTitles = [
    "Tasks",
    "Project",
    "P-impact",
    "Effort",
    "Clarity",
    "Owner",
    "Badges",
    "Due Date",
    "Allotment Date",
    "Status",
    "Files",
    "Links",
    "Submission Approval",
  ];
  let HeaderData = [];
  for (let column of columnTitles) {
    let id = generateRandomId();
    HeaderData.push({ title: column, id });
  }
  let header = await Tasks.find({ header: true });
  //header=await Tasks.create({columns:HeaderData,header:true});
 
}
//f();
router.get("/projectTask/:type", ensureAuth, async (req, res) => {
  try{
  let type = req.params.type;
  let employeeId = req.user._id;
  res.locals.type = type;
  let projects = await Projects.find({ assignedTo: [employeeId] });
  res.locals.projects = projects;
  res.render("projectTask");
  }
  catch (error) {
    console.error(error);
    res.status(500).send({ status: 500, message: "Server Error" });
  }
});

// Save Project in Database
router.post("/create/project", ensureAuth, ensureManager, async (req, res) => {
  try {
    let id = req.body._id;
    if (id) {
      const project = await Projects.findByIdAndUpdate(id, req.body);
    } else {
      const project = await Projects.create(req.body);
    }

    res.status(200).send({ status: 200, message: "Project Created" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server Error" });
  }
});
function convertDateRange(dateRange) {
  // Split the date range into start and end dates
  const [startDateStr, endDateStr] = dateRange.split(" - ");

  // Parse the date strings to Date objects
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // Format the Date objects into 'yyyy-mm-dd' format
  const startDateFormatted = formatDate(startDate);
  const endDateFormatted = formatDate(endDate);

  return {
    startDate: startDateFormatted,
    endDate: endDateFormatted,
  };
}

// async function f()
// {
//   await Tasks.deleteMany({});
// }
// f();
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is zero-based
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
// async function f()
// {
// let projects = await Projects.find({});
// for(let project of projects)
// {
//   if(project.deadline)
//   {
//     const { startDate, endDate } = convertDateRange(project.deadline);
//     project.startDate=startDate;
//     project.endDate=endDate;
//     await project.save();
//   }
//   if(project.owners?.length>0)
//   {
//     project.assignedTo=[project.owners[0]._id];
//     project.markModified('assignedTo')
//     await project.save();
//   }
//   console.log(project)
// }
// }
// setTimeout(f,5000);

router.post("/create/header/",ensureAuth,ensureManager, async (req, res) => {
  try {
    let id = req.body._id;
    let header;
    if (id) {
      header = await TableHeader.findByIdAndUpdate(id, req.body);
    } else {
      header = await TableHeader.create(req.body);
    }
    res.status(200).send(header);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});

router.delete("/create/header/",ensureAuth,ensureManager, async (req, res) => {
  try {
    let {id,usedName} = req.body;
   console.log
    if (id) {
       await TableHeader.findByIdAndDelete(id);
      
      let tasks=await Tasks.find({});
      
      for(let task of tasks)
      {
        delete task.data[usedName];
        task.markModified('data');
        await task.save();
      }
    }
    res.status(200).send({message:'Deleted'});
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});
router.post('/update/tableHeader',ensureAuth,async (req, res) => {
  try {
   
    let headers = req.body;
   
    for(let header of headers )
    { 
       let x = await TableHeader.findByIdAndUpdate(header.id, {srNo:header.srNo});
  }
   
    res.status(200).send({message:"updated"});
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});
router.get('/header/:id',ensureAuth,async (req, res) => {
  try {
   
    let id=req.params.id;
    let header = await TableHeader.findById(id);
    res.status(200).send(header);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});
async function CreateTableHeader() {
 await TableHeader.deleteMany({category: "ProjectTaskPageTasks"})
  let columns = [
    {
      srNo: 1,
      title: "Tasks",
      category: "ProjectTaskPageTasks",
      type: "text",
      usedName: "Tasks",
      style:"width:420px;"
    },
    {
      srNo: 6,
      title: "Objective",
      category: "ProjectTaskPageTasks",
      type: "dropdown",
      usedName: "objective",
      style:"width: 210px; display:flex;justify-content: center;"
    },
    {
      srNo: 13,
      title: "Project",
      category: "ProjectTaskPageTasks",
      type: "dropdown",
      usedName: "project",
      style:"width: 210px; display:flex;justify-content: center;"
    },
    {
      srNo: 8,
      title: "Key Result",
      category: "ProjectTaskPageTasks",
      type: "dropdown",
      usedName: "krs",
      style:"width: 210px; display:flex;justify-content: center;"
    },
    {
      srNo: 9,
      title: "Sub Key Result",
      category: "ProjectTaskPageTasks",
      type: "dropdown",
      usedName: "subkrs",
      style:"width: 210px; display:flex;justify-content: center;"
    },
    {
      srNo: 10,
      title: "PImpact",
      category: "ProjectTaskPageTasks",
      type: "label",
      usedName: "PImpact",
      labels:[{label:"Extreme",color:"#F04438",bgcolor:'#FEF3F2'},{label:"High",color:"#F79009",bgcolor:'#FFFAEB'},{label:"Very High",color:"#FB6514",bgcolor:'#FFF6ED'},{label:'Low',color:'#667085',bgcolor:'#F9FAFB'}],
      style:"width: 110px; display:flex;justify-content: center;"
      
    },
    {
      srNo: 7,
      title: "Effort",
      category: "ProjectTaskPageTasks",
      type: "number",
      usedName: "Effort",
      style:"width: 70px; display:flex;justify-content: center;"
    },
    {
      srNo: 2,
      title: "Time elapsed",
      category: "ProjectTaskPageTasks",
      type: "progressbar",
      usedName: "Progress",
      style:"width: 70px; display:flex;justify-content: center;"
    },
    {
      srNo: 11,
      title: "Clarity",
      category: "ProjectTaskPageTasks",
      type: "label",
      usedName: "Clarity",
      labels:[{label:"High",color:"#12B76A",bgcolor:'#ECFDF3'},{label:"Low",color:"#F79009",bgcolor:'#FFFAEB'},{label:"Medium",color:"#FB6514",bgcolor:'#FFF6ED'}],
      style:"width: 110px; display:flex;justify-content: center;"
    },
    {
      srNo: 12,
      title: "Owner",
      category: "ProjectTaskPageTasks",
      type: "people",
      usedName: "Owner",
      style:"width: 185px; display:flex;justify-content: flex-start;"
    },
    {
      srNo: 3,
      title: "Badges",
      category: "ProjectTaskPageTasks",
      type: "number",
      usedName: "Badges",
      style:"width: 70px; display:flex;justify-content: center;"
    },
    {
      srNo: 4,
      title: "Allotment Date",
      category: "ProjectTaskPageTasks",
      type: "date",
      usedName: "AllotmentDate",
      style:"width: 130px; display:flex;justify-content: center;"
    },
    {
      srNo: 5,
      title: "Status",
      category: "ProjectTaskPageTasks",
      type: "label",
      usedName: "Status",
      labels:[{label:"Completed",color:"#12B76A",bgcolor:'#ECFDF3'},{label:"In Progress",color:"#F79009",bgcolor:'#FFFAEB'},{label:"Upcoming",color:"#0BA5EC",bgcolor:'#F0F9FF'},{label:"Not Started",color:"#667085",bgcolor:'#F9FAFB'},{label:"On Hold",color:"#F04438",bgcolor:'#FEF3F2'}],
      style:"width: 110px; display:flex;justify-content: center;"
    },
    {
      srNo: 14,
      title: "Files",
      category: "ProjectTaskPageTasks",
      type: "files",
      usedName: "files",
      style:"width: 150px; display:flex;justify-content: center;"
    },
    {
      srNo: 15,
      title: "Links",
      category: "ProjectTaskPageTasks",
      type: "links",
      usedName: "links",
      style:"width: 150px; display:flex;justify-content: center;"
    },
    {
      srNo: 16,
      title: "Submission Approval",
      category: "ProjectTaskPageTasks",
      type: "label",
      usedName: "SubmissionApproval",
      labels:[{label:"Approved",color:"#12B76A",bgcolor:'#ECFDF3'},{label:"Pending",color:"#F79009",bgcolor:'#FFFAEB'},{label:"Rejected",color:"#F04438",bgcolor:'#FEF3F2'}],
      style:"width: 150px; display:flex;justify-content: center;"
    },
  ];

  for (let col of columns) {
    let header = await TableHeader.create(col);
  }
}
async function xi() {
  let col={
    srNo: 1,
    title: "Nudge",
    category: "ProjectTaskPageTasks",
    type: "image",
    usedName: "Nudge",
    style:"width:120px;"
  }
  let header = await TableHeader.create(col);
}
//xi();
async function CreateProjectPageTableHeader() {
   await TableHeader.deleteMany({category: "ProjectPageTasks"})
  let columns = [
    {
      srNo: 1,
      title: "Tasks",
      category: "ProjectPageTasks",
      type: "text",
      usedName: "Tasks",
    },
    {
      srNo: 7,
      title: "Key Result",
      category: "ProjectPageTasks",
      type: "text",
      usedName: "krs",
    },
    {
      srNo: 8,
      title: "Sub Key Result",
      category: "ProjectPageTasks",
      type: "status",
      usedName: "subkrs",
    },
    {
      srNo: 9,
      title: "PImpact",
      category: "ProjectPageTasks",
      type: "status",
      usedName: "PImpact",
    },
    {
      srNo: 3,
      title: "Effort",
      category: "ProjectPageTasks",
      type: "status",
      usedName: "Effort",
    },
    {
     srNo: 2,
     title: "Time elapsed",
     category: "ProjectPageTasks",
     type: "progressbar",
     usedName: "Progress",
   },
    {
      srNo: 10,
      title: "Clarity",
      category: "ProjectPageTasks",
      type: "status",
      usedName: "Clarity",
    },
    {
      srNo:11,
      title: "Owner",
      category: "ProjectPageTasks",
      type: "text",
      usedName: "Owner",
    },
    {
      srNo: 4,
      title: "Badges",
      category: "ProjectPageTasks",
      type: "text",
      usedName: "Badges",
    },
    {
      srNo: 5,
      title: "Allotment Date",
      category: "ProjectPageTasks",
      type: "date",
      usedName: "AllotmentDate",
    },
    {
      srNo: 6,
      title: "Status",
      category: "ProjectPageTasks",
      type: "status",
      usedName: "Status",
    },
    {
      srNo: 12,
      title: "Files",
      category: "ProjectPageTasks",
      type: "links",
      usedName: "files",
    },
    {
      srNo: 13,
      title: "Submission Approval",
      category: "ProjectPageTasks",
      type: "status",
      usedName: "SubmissionApproval",
    },
    {
      srNo: 14,
      title: "Links",
      category: "ProjectPageTasks",
      type: "links",
      usedName: "links",
    },
  ];
 
   for (let col of columns) {
     let header = await TableHeader.create(col);
   }
 }
 async function CreateSubTableHeader() {
  await TableHeader.deleteMany({category: "ProjectSubTaskPageTasks"})
   let columns = [
     {
       srNo: 1,
       title: "Sub Task",
       category: "ProjectSubTaskPageTasks",
       type: "text",
       usedName: "SubTask",
       style:"width:250px;"
     },
     {
       srNo: 5,
       title: "Effort",
       category: "ProjectSubTaskPageTasks",
       type: "number",
       usedName: "Effort",
       style:"width: 70px; display:flex;justify-content: center;"
     },
     {
       srNo: 2,
       title: "Time elapsed",
       category: "ProjectSubTaskPageTasks",
       type: "progressbar",
       usedName: "Progress",
       style:"width: 70px; display:flex;justify-content: center;"
     },
     {
       srNo: 9,
       title: "Owner",
       category: "ProjectSubTaskPageTasks",
       type: "people",
       usedName: "Owner",
       style:"width: 185px; display:flex;justify-content: flex-start;"
     },
     {
       srNo: 3,
       title: "Badges",
       category: "ProjectSubTaskPageTasks",
       type: "number",
       usedName: "Badges",
       style:"width: 70px; display:flex;justify-content: center;"
     },
     {
       srNo: 4,
       title: "Allotment Date",
       category: "ProjectSubTaskPageTasks",
       type: "date",
       usedName: "AllotmentDate",
       style:"width: 130px; display:flex;justify-content: center;"
     },
     {
       srNo: 6,
       title: "Status",
       category: "ProjectSubTaskPageTasks",
       type: "label",
       usedName: "Status",
       labels:[{label:"Completed",color:"#12B76A",bgcolor:'#ECFDF3'},{label:"In Progress",color:"#F79009",bgcolor:'#FFFAEB'},{label:"Upcoming",color:"#0BA5EC",bgcolor:'#F0F9FF'},{label:"Not Started",color:"#667085",bgcolor:'#F9FAFB'},{label:"On Hold",color:"#F04438",bgcolor:'#FEF3F2'}],
       style:"width: 110px; display:flex;justify-content: center;"
     },
     {
       srNo: 10,
       title: "Files",
       category: "ProjectSubTaskPageTasks",
       type: "files",
       usedName: "files",
       style:"width: 150px; display:flex;justify-content: center;"
     },
     {
       srNo: 11,
       title: "Links",
       category: "ProjectSubTaskPageTasks",
       type: "links",
       usedName: "links",
       style:"width: 150px; display:flex;justify-content: center;"
     },
     {
       srNo: 12,
       title: "Submission Approval",
       category: "ProjectSubTaskPageTasks",
       type: "label",
       usedName: "SubmissionApproval",
       labels:[{label:"Approved",color:"#12B76A",bgcolor:'#ECFDF3'},{label:"Pending",color:"#F79009",bgcolor:'#FFFAEB'},{label:"Rejected",color:"#F04438",bgcolor:'#FEF3F2'}],
       style:"width: 150px; display:flex;justify-content: center;"
     },
   ];
 
   for (let col of columns) {
     let header = await TableHeader.create(col);
   }
 }
//  CreateProjectPageTableHeader()
 //CreateTableHeader()
 //CreateSubTableHeader()
router.post("/create/task", ensureAuth, async (req, res) => {
  try {
    let taskid = req.body._id;
 
    let task;
    if (taskid) {
      task = await Tasks.findByIdAndUpdate(taskid, req.body);
    } else {
      task = await Tasks.create(req.body);
    }

    res.status(200).send(task);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server Error" });
  }
});

router.post('/update/Alltask',ensureAuth, async (req, res) => {
  try {
    let tasks = req.body;
   for(let task of tasks)
   {
    await Tasks.findByIdAndUpdate(task._id, task);
   }
    
    res.status(200).send({message:"updated"});
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server Error" });
  }
});
router.get("/task/:id", ensureAuth, ensureManager, async (req, res) => {
  try {
    let user = req.user;
    res.locals.user = user;
    let id = req.params.id;
    let projects = await Projects.find({});
    res.locals.Projects = projects;
    res.locals.krsassociated = projects.krs;
    let task = await Tasks.findById(id);
    let employeeList = await Admin.find({});
    let krsMap = new Map();
    let kr = await KR.find({});
    for (let krs of kr) {
      let lists = krsMap.get(krs.objectiveId.toString()) || [];
      lists.push(krs);
      krsMap.set(krs.objectiveId.toString(), lists);
    }

    let subkrlist = await SubKR.find({});

    let subkrmap = new Map();
    for (let subkr of subkrlist) {
      let lists = subkrmap.get(subkr.keyResultId.toString()) || [];
      lists.push(subkr);
      subkrmap.set(subkr.keyResultId.toString(), lists);
    }

    res.locals.subkrsmap = Array.from(subkrmap.entries());
    res.locals.krsmap = Array.from(krsMap.entries());
    res.locals.employeeList = employeeList;
    res.locals.task = task;

    res.render("TaskManager");
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server Error" });
  }
});
router.get("/taskEmployee/:id", ensureAuth, async (req, res) => {
  try {
    let user = req.user;
    res.locals.user = user;
    let id = req.params.id;
    let projects = await Projects.find({});
    res.locals.Projects = projects;
    let task = await Tasks.findById(id);
    res.locals.task = task;

    res.render("TaskEmployee");
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server Error" });
  }
});
router.delete("/create/task", ensureAuth, ensureManager, async (req, res) => {
  try {
    let taskid = req.body._id;

    if (taskid) {
      let task = await Tasks.findByIdAndDelete(taskid);
    }
    res.status(200).send({ status: 200, message: "Task Deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server Error" });
  }
});
router.get("/tasks/:ProjectId", ensureAuth, ensureManager, async (req, res) => {
  try {
    let projectAssociatedId = req.params.ProjectId;
    let tasks = await Tasks.find({ projectAssociatedId });
    let nonSubmittedTasks= tasks.filter((task) => !task.submitted);
   tasks=nonSubmittedTasks;
    tasks.sort(function (a, b) {
      return new Date(a.deadline) - new Date(b.deadline);
    });
    tasks.sort((a, b) => {
      return a.srNo - b.srNo;
    }); 
    res.status(200).send({ data: tasks });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
});
router.get(
  "/tasks/:employeeId",
  ensureAuth,
  ensureManager,
  async (req, res) => {
    try {
      let assignedTo = req.params.employeeId;
      let tasks = await Tasks.find({ assignedTo });
      let nonSubmittedTasks= tasks.filter((task) => !task.submitted);
   tasks=nonSubmittedTasks;
      tasks.sort(function (a, b) {
        return new Date(a.deadline) - new Date(b.deadline);
      });
      tasks.sort((a, b) => {
        return a.srNo - b.srNo;
      }); 
      res.status(200).send({ data: tasks });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Server Error" });
    }
  }
);

// Edit Project in Database
router.put(
  "/create/project/:projectId",
  ensureAuth,
  ensureManager,
  async (req, res) => {
    try {
      let projectId = req.params.projectId;
      const project = await Projects.findByIdAndUpdate(projectId, req.body);

      res.status(200).send({ status: 200, message: "Project Created" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Server Error" });
    }
  }
);

// Delete Project from DataBase
router.delete(
  "/create/project/:id",
  ensureAuth,
  ensureManager,
  async (req, res) => {
    try {
      let projectId = req.params.id;
      await Projects.findByIdAndDelete(projectId);
      res.status(200).send({ status: 200, message: "Project Deleted" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Server Error" });
    }
  }
);
router.get('/projects/:projectId', async (req, res) => {
  try {
    let projectId = req.params.projectId;
    let project = await Projects.findById(projectId);
    res.status(200).send(project);

  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server Error" });
  }
});

// pin a project
router.put("/pin/project/:id", ensureAuth, async (req, res) => {
  try {
    const projects = await Projects.findById(req.params.id);

    const employeepinned = projects.pinnedBy ? projects.pinnedBy : [];
    const employeeID = req.body.employeeID;

    for (let i = 0; i < employeepinned.length; i++) {
      if (employeepinned[i] && employeepinned[i].toString() == employeeID) {
        employeepinned.splice(i, 1);
        projects.pinnedBy = employeepinned;
        projects.markModified("pinnedBy");
        await projects.save();
        return res.status(200).send({ message: "Project Updated" });
      }
    }
    if (employeeID) employeepinned.push(employeeID);
    projects.pinnedBy = employeepinned;
    projects.markModified("pinnedBy");
    await projects.save();

    return res.status(200).send({ status: 200, message: "Project Updated" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server Error" });
  }
});

// get all project of a particular employee
router.get(
  "/project/:employeeId",
  ensureAuth,
  ensureManager,
  async (req, res) => {
    try {
      const employeeID = req.params.employeeId;
      const user = await Admin.findById(employeeID);
      let pinnedproject = 0;
      let projectsemployee = [];
      const projects = await Projects.find({});

      // Function to check if the given employeeId is part of owners or teams of a project
      function isEmployeePartOfProject(project) {
        return project.assignedTo.some(
          (employee) => employee._id.toString() === employeeID
        );
      }

      // Filter projects based on employeeId
      projectsemployee = projects.filter(isEmployeePartOfProject);

      // for (let proj of projectsemployee) {
      //   proj.canedit = false;
      //   proj.isPinnedByAdmin = false;
      //   let kr = await KR.find({ projectId: proj._id });
      //   if (!kr) kr = [];
      //   proj.kr = kr; // Append the 'kr' data to the project object

      //   if (proj.pinnedBy && proj.pinnedBy.includes(user._id)) {
      //     pinnedproject++;
      //     proj.isPinnedByAdmin = true;
      //   }
      //   if (proj.editaccess && proj.editaccess.includes(user._id)) {
      //     proj.canedit = true;
      //   }
      // }

      const sortedProjects = projectsemployee.sort((a, b) => {
        // if (a.isPinnedByAdmin !== b.isPinnedByAdmin) {
        //   return a.isPinnedByAdmin ? -1 : 1; // Pinned projects come first
        // } else {
        return new Date(b.createdAt) - new Date(a.createdAt);
        //}
      });
      const employeeList = await Admin.find({});
      res.locals.employeeList = employeeList;
      res.locals.projects = sortedProjects;
      // res.locals.tasks = sortedProjects;
      // res.locals.pinnedProjectByManager = pinnedproject;
      // res.locals.pinnedTaskByEmployee = 0;
      // res.locals.pinnedTaskByManager = 0;
      res.locals.user = user;

      res.render("view-projects");
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Server Error" });
    }
  }
);

router.post("/submit/task", ensureAuth, async (req, res) => {
  try {
    let id = req.body._id;
    let taskId= req.body.taskId;
    let tasksubmitted;
   
    if (id) {
      tasksubmitted = await TaskSubmission.findByIdAndUpdate(id, req.body);
      if(!tasksubmitted)
      tasksubmitted = await TaskSubmission.create(req.body);
    } else {
      // let tasksubmisson=await TaskSubmission.findOne({ 'tasks.id': taskid})
      
      // if(tasksubmisson) {
      //   tasksubmitted = await TaskSubmission.findByIdAndUpdate(tasksubmisson._id, req.body);
      // }
      // else
      tasksubmitted = await TaskSubmission.create(req.body);
      // await TaskSubmission.findByIdAndUpdate(req.body.tasks?.id, {
      //   submitted: true,
      // });
    }
    let task=await Tasks.findById(taskId);
    if(task)
    {
      
       task.submitted=true;
      task.submittedAt=new Date();
      // task.data.Status={bgcolor: "#ECFDF3",color:  "#12B76A",label:"Completed"}
    task.markModified('data');
      await task.save();
    }
    res.status(200).send(tasksubmitted);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server Error" });
  }
});
router.post("/submit/task/Manger", ensureAuth,ensureManager, async (req, res) => {
  try {
    let id = req.body._id;
    let taskId= req.body.taskId;
    let tasksubmitted;
   
    if (id) {
      tasksubmitted = await TaskSubmission.findByIdAndUpdate(id, req.body);
      if(!tasksubmitted)
      tasksubmitted = await TaskSubmission.create(req.body);
    } else {
      // let tasksubmisson=await TaskSubmission.findOne({ 'tasks.id': taskid})
      
      // if(tasksubmisson) {
      //   tasksubmitted = await TaskSubmission.findByIdAndUpdate(tasksubmisson._id, req.body);
      // }
      // else
      tasksubmitted = await TaskSubmission.create(req.body);
      // await TaskSubmission.findByIdAndUpdate(req.body.tasks?.id, {
      //   submitted: true,
      // });
    }
    let task=await Tasks.findById(taskId);
    if(task)
    {
      console.log(tasksubmitted?.OutcomeStatus,task,"1")
      if(tasksubmitted?.OutcomeStatus!="Iterations")
     { task.submitted=true;
      task.submittedAt=new Date();
      task.data.Status={bgcolor: "#ECFDF3",color:  "#12B76A",label:"Completed"}
    }  
     else
      { console.log(task)
        task.submitted=false;
      task.submittedAt=null;
      task.data.Status={bgcolor: "rgba(200.77802361867504, 83.83940550482069, 87.12725126426501,0.06)",color:  "rgb(200.77802361867504, 83.83940550482069, 87.12725126426501)",label:"Iterations"}
    }
    task.markModified('data');
      await task.save();
    }
    res.status(200).send(tasksubmitted);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server Error" });
  }
});

router.post('/deleteTaskSubmission',ensureAuth,ensureManager,async(req,res)=>{
try{
  let ids=req.body.ids;
  for(let id of ids)
{
  await TaskSubmission.findByIdAndDelete(id.tsid)
  await Tasks.findByIdAndUpdate(id.tid,{submitted:false})
}
res.send({ message: "Task Submission Deleted" })
} catch (err) {
  console.log(err);
  res.status(500).send({ message: "Server Error" });
}
});
router.post('/deleteTask',ensureAuth,ensureManager,async(req,res)=>{
  try{
    let ids=req.body.ids;
    for(let id of ids)
  {
    await Tasks.findByIdAndDelete(id)
    await SubTask.deleteMany({'data.taskId':id})
   
  }
  res.send({ message: "Task  Deleted" })
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server Error" });
  }
  });
// return all the projects that have been created yet
router.get("/project", ensureAuth, ensureManager, async (req, res) => {
  try {
    res.locals.managerVisiting=false;
    res.locals.taskgetdataurl='all'
    let tab=req.query.tab;
    let user=req.user;
    res.locals.managerVisitingInfo=user;
    res.locals.managerVisitingId="ProjectPage"+user._id;
    if(!tab)
    tab='Projects';
    res.locals.tab=tab;
    let activeTab=req.query.activetab;
    res.locals.activeTab=activeTab;
    
    const projects = await Projects.find({});
    res.locals.projects = projects
    let tasks = await Tasks.find({});
   let nonSubmittedTasks= tasks.filter((task) => !task.submitted);
   tasks=nonSubmittedTasks;
    tasks.sort((a, b) => {
      return new Date(b.createAt).getTime() - new Date(a.createAt).getTime();
    });
    tasks.sort((a, b) => {
      return a.srNo - b.srNo;
    }); 
    let projectMap = new Map();
    for (let project of projects) {
      if (project.objectiveId) {
        let list = projectMap.get(project.objectiveId) || [];
        list.push({ id: project._id.toString(), title: project.title });
        projectMap.set(project.objectiveId, list);
      }
    }
    res.locals.projectMap = Array.from(projectMap.entries());
    res.locals.tasks = tasks;
    let taskmap = new Map();
    for (let task of tasks) {
      let list = taskmap.get(task.data.projectId) || [];
      list.push(task);
      taskmap.set(task.data.projectId, list);
    }
    let employeeList = new Map();
    let employees = await Admin.find({});
    for (let employee of employees) {
      employeeList.set(employee._id.toString(), employee);
    }

    for (let project of projects) {
      if (project.assignedTo?.length > 0) {
        project.user = employeeList.get(project.assignedTo[0]);
      }
    }

    const sortedProjects = projects.sort((a, b) => {
      // if (a.isPinnedByAdmin !== b.isPinnedByAdmin) {
      //   return a.isPinnedByAdmin ? -1 : 1; // Pinned projects come first
      // } else {
      return new Date(b.createdAt) - new Date(a.createdAt);
      //}
    });
    let companies = await Company.find({});
    let sortedCompanies = companies.sort((a, b) => {
      return a.srNo - b.srNo;
    });
    res.locals.companies = sortedCompanies;
    let AllPilers = await StrategicPillar.find({});

    let Pillers = [];

    for (let i = 0; i < sortedCompanies.length; i++) {
      Pillers.push([]);

      AllPilers.forEach((pillar) => {
        const companyId = pillar.CompanyId;
        if (companyId == sortedCompanies[i]._id) Pillers[i].push(pillar);
      });
    }

    let OKRs = await Objectives.find({});

    let okrsMap = new Map();
    for (let okr of OKRs) {
      let lists = okrsMap.get(okr.StrategicPillarsId.toString()) || [];
      lists.push(okr);
      okrsMap.set(okr.StrategicPillarsId.toString(), lists);
    }

    let kr = await KR.find({});
    let krsMap = new Map();
    for (let krs of kr) {
      let lists = krsMap.get(krs.objectiveId.toString()) || [];
      lists.push(krs);
      krsMap.set(krs.objectiveId.toString(), lists);
    }

    let subkrlist = await SubKR.find({});

    let subkrmap = new Map();
    for (let subkr of subkrlist) {
      let lists = subkrmap.get(subkr.keyResultId.toString()) || [];
      lists.push(subkr);
      subkrmap.set(subkr.keyResultId.toString(), lists);
    }
    let TaskSubmissions = await TaskSubmission.find({});
    TaskSubmissions.sort((a,b)=>{

      if (a.status === 'Pending' && b.status !== 'Approved') {
        return -1; // a comes first because it's pending
      } else if (a.status !== 'Approved' && b.status === 'Pending') {
        return 1; // b comes first because it's pending
      } else {
        // Keep the original order if both have the same status or both are not pending
        return 0;
      }
    })
    res.locals.TaskSubmissions = TaskSubmissions;
    res.locals.subkrsmap = Array.from(subkrmap.entries());
    res.locals.okrsmap = Array.from(okrsMap.entries());
    res.locals.krsmap = Array.from(krsMap.entries());

    res.locals.employeeList = employees;
    let teams = await TeamTable.find({});
    res.locals.teams = teams;
    res.locals.projects = sortedProjects;
    let TaskTableHeaders = await TableHeader.find({
      category: "ProjectTaskPageTasks",
    });
    TaskTableHeaders.sort((a, b) => {
      return a.srNo - b.srNo;
    });
    res.locals.TaskTableHeaders = TaskTableHeaders;
    res.locals.initiative = tasks;
    res.locals.user = user;
    let subTasksList = await SubTask.find({});
    
    let subTasksMap = new Map();
    let subTasks = [];
    for (let subTask of subTasksList) {
      let list = subTasksMap.get(subTask.data.taskId) || [];
      list.push(subTask);
      subTasksMap.set(subTask.data.taskId, list);
    }
    for (let initiative of tasks) {
      let list = subTasksMap.get(initiative._id.toString()) || [];
      subTasks.push(list);
    }
    let subTaskHeader=await TableHeader.find({category: 'ProjectSubTaskPageTasks'})
    subTaskHeader.sort((a,b) =>{
    return a.srNo - b.srNo;
    })
    
    res.locals.subTaskHeader = subTaskHeader
    subTasks.forEach((subtask)=>{
      subtask.sort((a, b) =>{
        return a.srNo - b.srNo;
      })
    })
    res.locals.subTasks = subTasks;

    for (let comapnyIndex = 0; comapnyIndex < Pillers.length; comapnyIndex++) {
      for (
        let pillarIndex = 0;
        pillarIndex < Pillers[comapnyIndex].length;
        pillarIndex++
      ) {
        let objectives =
          okrsMap.get(Pillers[comapnyIndex][pillarIndex]._id.toString()) || [];
          
        let objecitve_no = objectives.length;
        let project_no = 0;
        let task_no = 0;
        let subtask_no = 0;
        let membersSet = new Set();

        for (let objective of objectives) {
          let initial_project_no = project_no
          let initial_task_no = task_no
          for(let team of objective.teams)
          membersSet = new Set([...membersSet, ...team.employees]);
          
          membersSet = new Set([...membersSet, ...objective.owner]);
          let progress=0;
          let krs_obj=krsMap.get(objective._id.toString())||[];
         
          for(let kr of krs_obj)
          {
            let Percentage_=(kr.matrix.currentValue - kr.matrix.startingValue) / ( kr.matrix.targetValue -  kr.matrix.startingValue) * 100 ;
      Percentage_=Math.min(100, Percentage_);
      progress+=Percentage_;
          }
          progress=progress/krs_obj.length;
          if(isNaN(progress))
          progress=0;
          let projects = projectMap.get(objective._id.toString()) || [];
          project_no = projects.length;
          for (let project of projects) {
            let tasks = taskmap.get(project.id.toString()) || [];
            task_no += tasks.length || 0;
            for (let task of tasks) {
              subtask_no += subTasksMap.get(task._id.toString())?.length || 0;
            }
          }
          let obj_projects=Math.max(0,project_no-initial_project_no);
          let obj_tasks=Math.max(0,task_no-initial_task_no)
         
           await Objectives.findByIdAndUpdate(objective._id, {projects:obj_projects,tasks:obj_tasks,progress:progress})
        }
        Pillers[comapnyIndex][pillarIndex].objectives = Math.max(0,objecitve_no);
        Pillers[comapnyIndex][pillarIndex].projects = Math.max(0,project_no);
        Pillers[comapnyIndex][pillarIndex].tasks = Math.max(0,task_no);
        Pillers[comapnyIndex][pillarIndex].initiatives = Math.max(0,subtask_no);
        Pillers[comapnyIndex][pillarIndex].members = [...membersSet];
        StrategicPillar.findByIdAndUpdate(
          Pillers[comapnyIndex][pillarIndex]._id,
          Pillers[comapnyIndex][pillarIndex]
        );
      }
    }

    res.locals.Pillers = Pillers;
    res.render("projectTask");
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server Error" });
  }
});

// async function f()
// {
// let projects = await Projects.find({});
// for(let project of projects)
// {  if(project.owner?.length>0)
//   {project.assignedTo[0]=project.owner[0]._id;
//   await project.save();}
// }
// }
// f();
// get project data by projectId

router.get("/projectOne/:id", ensureAuth, ensureManager, async (req, res) => {
  try {
    let id = req.params.id;
    if (!id) return res.status(404).send({ message: "Server Error" });
    const project = await Projects.findById(id);
    res.locals.project = project;
    let OKRs = await Objectives.find({});
    let teams = await TeamTable.find({});
    let TaskTableHeaders = await TableHeader.find({
      category: "ProjectPageTasks",
    });
    TaskTableHeaders.sort((a, b) => {
      return a.srNo - b.srNo;
    });
    res.locals.TaskTableHeaders = TaskTableHeaders;
    res.locals.teams = teams;
    res.locals.OKRs = OKRs;
    let employees = await Admin.find({});
    res.locals.employeeList = employees;
    let krsMap = new Map();
    let kr = await KR.find({});
    for (let krs of kr) {
      let lists = krsMap.get(krs.objectiveId.toString()) || [];
      lists.push(krs);
      krsMap.set(krs.objectiveId.toString(), lists);
    }

    let subkrlist = await SubKR.find({});

    let subkrmap = new Map();
    for (let subkr of subkrlist) {
      let lists = subkrmap.get(subkr.keyResultId.toString()) || [];
      lists.push(subkr);
      subkrmap.set(subkr.keyResultId.toString(), lists);
    }

    res.locals.subkrsmap = Array.from(subkrmap.entries());
    res.locals.krsmap = Array.from(krsMap.entries());

    let initiatives = await Tasks.find({ "data.projectId": id });
    let nonSubmittedTasks= initiatives.filter((task) => !task.submitted);
    initiatives=nonSubmittedTasks;
    let subTasksList = await SubTask.find({ "data.projectId": id });
    let subTasksMap = new Map();
    let subTasks = [];
    for (let subTask of subTasksList) {
      let list = subTasksMap.get(subTask.data.taskId) || [];
      list.push(subTask);
      subTasksMap.set(subTask.data.taskId, list);
    }
    for (let initiative of initiatives) {
      let list = subTasksMap.get(initiative._id.toString()) || [];
      subTasks.push(list);
    }
    res.locals.initiative = initiatives;
    let subTaskHeader=await TableHeader.find({category: 'ProjectSubTaskPageTasks'})
    
    subTaskHeader.sort((a,b) =>{
    return a.srNo - b.srNo;
    })
    res.locals.subTaskHeader = subTaskHeader
    res.locals.subTasks = subTasks;
    res.render("Projects");
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server Error" });
  }
});
router.get('/TaskSubmission/:id',ensureAuth,async(req,res)=>{
try{
  let id=req.params.id;
  let taskSubmission=await TaskSubmission.findOne({taskId:id})

  res.status(200).send({data:taskSubmission})
}
catch(err)
{
  console.log(err);
  res.status(500).send({ message: "Server Error" });
}

})

async function fxxxxx()
{
  let subtasks=await SubTask.find({});
  for(let subtask of subtasks) {
    subtask.data['SubTask'] = subtask.data['Tasks']
     subtask.markModified('data')
     await subtask.save();
  }
}
//fxxxxx();
module.exports = router;

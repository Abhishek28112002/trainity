const CareerTask = require("../models/CareerTask");
const UserCareerTaskInfo = require("../models/UserCareerTaskInfo");

const getAllCareerTasks = async (req, res, next) => {
  const careerTasksArr = await CareerTask.find({});
  res.locals.careerTasksCnt = careerTasksArr.length;

  // Sorting Learning Tasks with Module Name and days to unlock
  careerTasksArr.sort((a, b) => {
    let fa = a.taskID,
      fb = b.taskID;

    if (fa < fb) {
      return -1;
    }
    if (fa > fb) {
      return 1;
    }
  });

  req.careerTasksArr = careerTasksArr;

  next();
};

const getCareerTaskInfo = async (req, res, next) => {
  const user = req.user;

  let userCareerTaskInfo = await UserCareerTaskInfo.findOne({
    userID: user.googleID,
  });
  if (userCareerTaskInfo) {
    req.userCareerTaskInfo = userCareerTaskInfo;
    const careerTasksArr = await CareerTask.find({});
    let careerTasks = [];
    for (var ct of careerTasksArr) {
      let careerTask = {
        _id: ct._id,
        title: ct.title,
        taskID: ct.taskID,
        courseID: ct.courseID,
        innerHTML: ct.innerHTML,
        taskVideo: ct.taskVideo,
        assgnVideo: ct.assgnVideo,
        taskDoc: ct.taskDoc,
        taskAssgn: ct.taskAssgn,
        icon: ct.icon,
        status: 0,
        feedback: "",
      };
      const idStr = careerTask._id.toString();
      const subId = userCareerTaskInfo.submittedTasks.indexOf(idStr);
      if (subId != -1) {
        careerTask.status = 1;
      }
      const napprov = userCareerTaskInfo.notApprovedTasks.find(
        (task) => task.id == idStr
      );
      if (napprov) {
        careerTask.status = 3;
        careerTask.feedback = napprov.feedback;
      }
      const cmptid = userCareerTaskInfo.completedTasks.indexOf(idStr);
      if (cmptid != -1) careerTask.status = 2;

      careerTasks.push(careerTask);
    }
    req.careerTasks = careerTasks;
  } else {
    userCareerTaskInfo = await UserCareerTaskInfo.create({
      userID: user.googleID,
      allowed: 0,
    });
    req.userCareerTaskInfo = userCareerTaskInfo;
  }
  next();
};

const getUnderReviewCareerTasks = async (req, res, next) => {
  let underReviewArr = [];
  // const userCareerTaskInfoArr = await UserCareerTaskInfo.find({ allowed: 1 });
  // for(var userCareerTaskInfo of userCareerTaskInfoArr) {
  //   if(userCareerTaskInfo.submittedTasks.length>0){
  //     for(let i=0; i<userCareerTaskInfo.submittedTasks.length; i++){
  //       const taskId = userCareerTaskInfo.submittedTasks[i];
  //       let taskInfo = userCareerTaskInfo.taskInfo.find((taskId) => {

  //       })
  //     }
  //   }
  // }
  next();
};

module.exports = {
  getAllCareerTasks,
  getCareerTaskInfo,
  getUnderReviewCareerTasks,
};

const ProjectSubmission = require("../models/ProjectSubmission");
const Project = require("../models/Project");
const UserLearningInfo = require("../models/UserLearningInfo");
const ModalSolution = require("../models/ModalSolution");
const moment = require("moment");
const User = require("../models/User");

// Get All the Projects
const getProjects = async (req, res, next) => {
  const user = req.user;
  const projects = await Project.find({ courseID: 102 });
  projects.sort((a, b) => {
    return a.projectID - b.projectID;
  });

  res.locals.projects = projects;
  req.projects = projects;

  next();
};

const getAllProjects = async (req, res, next) => {
  const user = req.user;
  const projects = await Project.find({});
  projects.sort((a, b) => {
    return a.projectID - b.projectID;
  });
  res.locals.projects = projects;
  req.projects = projects;

  next();
};

// Middleware Functions
const getAllProjectSubmissions = async (req, res, next) => {
  const projectSubmissions = await ProjectSubmission.find({});
  req.projectSubmissions = projectSubmissions;
  next();
};

const getPendingProjectSubmissions = async (req, res, next) => {
  const projectSubmissions = await ProjectSubmission.find({ subScore: 0 });
  // req.projectSubmissions = projectSubmissions;
  req.projectSubmissions = [];
  next();
};

const updateProjectDetails = async (userID) => {
  const user = await User.find({ googleID: userID });

  const userLearningInfo = await UserLearningInfo.findOne({ userID });
  const projects = await Project.find({});
  projects.sort((a, b) => {
    return a.projectID - b.projectID;
  });
  let projectDetails = [];

  let completedCnt = 0;
  for (let i = 0; i < projects.length; i++) {
    const userSubmissions = await ProjectSubmission.find({
      userID,
      projectID: i + 1,
    });
    // console.log(i, userSubmissions);
    const curr = moment();
    const deadlineDate = moment(user.createdAt).add("days", projects[i].days);

    let deadlineStr = deadlineDate.toString();
    deadlineStr = deadlineDate.format("Do") + " " + deadlineDate.format("MMM");

    let approvedByDate = "";

    // Check for Project Lab
    let projectLabExist = userLearningInfo.projectLabs.indexOf(i + 1);
    if (projectLabExist != -1) projectLabExist = 1;
    else projectLabExist = 0;

    if (userSubmissions.length == 0) {
      if (i == 0) {
        projectDetails.push({
          projectID: projects[i].projectID,
          title: projects[i].title,
          points: projects[i].points,
          icon: projects[i].icon,
          status: 1,
          link: "",
          subCnt: 0,
          projectLab: projectLabExist,
          feedback: "",
          plagCheck: 0,
          subScore: 0,
          score: 0,
          deadline: 0,
          deadlineDate: deadlineStr,
          approvedByDate,
          checkDate: "-1",
        });
      } else if (projectDetails[i - 1].status <= 1) {
        projectDetails.push({
          projectID: projects[i].projectID,
          title: projects[i].title,
          points: projects[i].points,
          icon: projects[i].icon,
          status: 0,
          link: "",
          subCnt: 0,
          projectLab: 0,
          feedback: "",
          plagCheck: 0,
          subScore: 0,
          score: 0,
          deadline: 0,
          deadlineDate: deadlineStr,
          approvedByDate,
          checkDate: "-1",
        });
      } else {
        projectDetails.push({
          projectID: projects[i].projectID,
          title: projects[i].title,
          points: projects[i].points,
          icon: projects[i].icon,
          status: 1,
          link: "",
          subCnt: 0,
          projectLab: projectLabExist,
          feedback: "",
          plagCheck: 0,
          subScore: 0,
          score: 0,
          deadline: 0,
          deadlineDate: deadlineStr,
          approvedByDate,
          checkDate: "-1",
        });
      }
    } else {
      userSubmissions.sort((a, b) => {
        return b.subId - a.subId;
      });
      const lastSubmission = userSubmissions[0];

      let daysAfter =
        (deadlineDate - lastSubmission.date) / (1000 * 60 * 60 * 24);
      daysAfter = Math.round(daysAfter);
      let submitDate = moment(lastSubmission.date);
      submitDate = submitDate.format("Do") + " " + submitDate.format("MMM");
      if (lastSubmission.plagCheck > 0) {
        projectDetails.push({
          projectID: projects[i].projectID,
          title: projects[i].title,
          points: projects[i].points,
          icon: projects[i].icon,
          status: 3,
          link: lastSubmission.subLink,
          subCnt: lastSubmission.subId,
          projectLab: projectLabExist,
          feedback: "",
          plagCheck: lastSubmission.plagCheck,
          subScore: -1,
          score: 0,
          deadline: daysAfter,
          deadlineDate: deadlineStr,
          approvedByDate,
          submitDate,
          checkDate: lastSubmission.checkDate,
        });
      } else {
        let projectStatus = 2;
        if (lastSubmission.subScore == -1) projectStatus = 3;
        else if (lastSubmission.subScore >= 1 && lastSubmission.subScore <= 5)
          projectStatus = 4;
        else projectStatus = 2;

        if (projectStatus == 2) {
          let approveDate = moment(lastSubmission.date).add("days", 7);
          approvedByDate =
            approveDate.format("Do") + " " + approveDate.format("MMM");
        }

        let score = 0;
        if (projectStatus == 4) {
          completedCnt++;
          score = projects[i].points;
          let reduction = 0;
          if (lastSubmission.subScore == 1) reduction += 60;
          else if (lastSubmission.subScore == 2) reduction += 50;
          else if (lastSubmission.subScore == 3) reduction += 30;
          else if (lastSubmission.subScore == 4) reduction += 10;
          if (projectLabExist) reduction = Math.min(100, reduction + 40);
          if (lastSubmission.subId > 2)
            reduction = Math.min(100, reduction + 20);
          if (daysAfter < 0) reduction = Math.min(100, reduction + 5);

          score = score * ((100 - reduction) / 100);
          score = Math.round(score * 10) / 10;
        }

        projectDetails.push({
          projectID: projects[i].projectID,
          title: projects[i].title,
          points: projects[i].points,
          icon: projects[i].icon,
          status: projectStatus,
          subLink: lastSubmission.subLink,
          subCnt: lastSubmission.subId,
          projectLab: projectLabExist,
          feedback: lastSubmission.feedback,
          plagCheck: lastSubmission.plagCheck,
          subScore: lastSubmission.subScore,
          score: score,
          deadline: daysAfter,
          deadlineDate: deadlineStr,
          approvedByDate,
          submitDate,
          checkDate: lastSubmission.checkDate,
        });
      }
    }
  }
  userLearningInfo.projectDetails = projectDetails;
  // console.log(userLearningInfo);
  await userLearningInfo.save();
  return userLearningInfo;
};

module.exports = {
  getAllProjectSubmissions,
  getPendingProjectSubmissions,
  getProjects,
  getAllProjects,
  updateProjectDetails,
};

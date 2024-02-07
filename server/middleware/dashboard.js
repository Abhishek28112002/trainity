const ProjectSubmission = require("../models/ProjectSubmission");
const Project = require("../models/Project");
const User = require("../models/User");
const Metrics = require("../models/Metrics");
const UserLearningInfo = require("../models/UserLearningInfo");
const moment = require("moment");

// (async () => {
//   const projectsArr = await Project.find({ courseID: 102 });
//   //   const projectMetric = await Metrics.find({})
//   let categoriesArr = [];
//   for (let i = 0; i < projectsArr.length; i++) {
//     categoriesArr.push(projectsArr[i].title);
//   }
//   let seriesArr = [];
//   let approvedSeriesArr = [];
//   let rejectedSeriesArr = [];
//   let underReviewSeriesArr = [];
//   let plagSeriesArr = [];
//   for (let i = 0; i < projectsArr.length; i++) {
//     const projectID = projectsArr[i].projectID;
//     const projectTitle = projectsArr[i].title;
//     const totalSubCntArr = await ProjectSubmission.find({
//       projectID: projectID,
//     });
//     let totalSubCnt = totalSubCntArr.length;
//     const underReviewArr = await ProjectSubmission.find({
//       projectID: projectID,
//       subScore: 0,
//       plagCheck: 0,
//     });
//     let underReviewCnt = underReviewArr.length;
//     const rejectedArr = await ProjectSubmission.find({
//       projectID: projectID,
//       subScore: -1,
//       plagCheck: 0,
//     });
//     let rejectedCnt = rejectedArr.length;
//     let copiedCnt = 0;
//     for (let plag = 1; plag <= 3; plag++) {
//       const copiedArr = await ProjectSubmission.find({
//         projectID: projectID,
//         plagCheck: plag,
//       });
//       copiedCnt += copiedArr.length;
//     }
//     let approvedCnt = 0;
//     for (let score = 1; score <= 5; score++) {
//       const approvedArr = await ProjectSubmission.find({
//         projectID: projectID,
//         subScore: score,
//       });
//       approvedCnt += approvedArr.length;
//     }
//     approvedSeriesArr.push(approvedCnt);
//     rejectedSeriesArr.push(rejectedCnt);
//     underReviewSeriesArr.push(underReviewCnt);
//     plagSeriesArr.push(copiedCnt);
//   }
//   seriesArr.push({
//     name: "Approved",
//     data: approvedSeriesArr,
//   });
//   seriesArr.push({
//     name: "Rejected",
//     data: rejectedSeriesArr,
//   });
//   seriesArr.push({
//     name: "Review",
//     data: underReviewSeriesArr,
//   });
//   seriesArr.push({
//     name: "Copied",
//     data: plagSeriesArr,
//   });
//   const metricsObj = await Metrics.create({
//     courseID: 102,
//     projectStatData: seriesArr,
//   });
//   console.log(metricsObj);
// })();

const getProjectStatistics = async (req, res, next) => {
  const projectsArr = await Project.find({ courseID: 102 });
  projectsArr.sort((a, b) => {
    return a.projectID - b.projectID;
  });
  let categoriesArr = [];
  for (let i = 0; i < projectsArr.length; i++) {
    categoriesArr.push(projectsArr[i].title);
  }
  const metric = await Metrics.findOne({ courseID: 102 });
  //   let seriesArr = [];
  //   let approvedSeriesArr = [];
  //   let rejectedSeriesArr = [];
  //   let underReviewSeriesArr = [];
  //   let plagSeriesArr = [];
  //   for (let i = 0; i < projectsArr.length; i++) {
  //     const projectID = projectsArr[i].projectID;
  //     const projectTitle = projectsArr[i].title;
  //     const totalSubCntArr = await ProjectSubmission.find({
  //       projectID: projectID,
  //     });
  //     let totalSubCnt = totalSubCntArr.length;
  //     const underReviewArr = await ProjectSubmission.find({
  //       projectID: projectID,
  //       subScore: 0,
  //       plagCheck: 0,
  //     });
  //     let underReviewCnt = underReviewArr.length;
  //     const rejectedArr = await ProjectSubmission.find({
  //       projectID: projectID,
  //       subScore: -1,
  //       plagCheck: 0,
  //     });
  //     let rejectedCnt = rejectedArr.length;
  //     let copiedCnt = 0;
  //     for (let plag = 1; plag <= 3; plag++) {
  //       const copiedArr = await ProjectSubmission.find({
  //         projectID: projectID,
  //         plagCheck: plag,
  //       });
  //       copiedCnt += copiedArr.length;
  //     }
  //     let approvedCnt = 0;
  //     for (let score = 1; score <= 5; score++) {
  //       const approvedArr = await ProjectSubmission.find({
  //         projectID: projectID,
  //         subScore: score,
  //       });
  //       approvedCnt += approvedArr.length;
  //     }
  //     approvedSeriesArr.push(approvedCnt);
  //     rejectedSeriesArr.push(rejectedCnt);
  //     underReviewSeriesArr.push(underReviewCnt);
  //     plagSeriesArr.push(copiedCnt);
  //   }
  //   seriesArr.push({
  //     name: "Approved",
  //     data: approvedSeriesArr,
  //   });
  //   seriesArr.push({
  //     name: "Rejected",
  //     data: rejectedSeriesArr,
  //   });
  //   seriesArr.push({
  //     name: "Review",
  //     data: underReviewSeriesArr,
  //   });
  //   seriesArr.push({
  //     name: "Copied",
  //     data: plagSeriesArr,
  //   });
  //   console.log(approvedSeriesArr);
  //   console.log(plagSeriesArr);
  //   console.log(rejectedSeriesArr);
  //   console.log(underReviewSeriesArr);
  //   console.log(seriesArr);
  res.locals.categoriesArr = categoriesArr;
  //   console.log(metric.projectStatData);
  res.locals.seriesArr = metric.projectStatData;
  next();
};

const getLevelsInfo = async (req, res, next) => {
  const userLearningInfoArr = await UserLearningInfo.find({});
  let completedCnt = new Array(10);
  for (let i = 0; i < 10; i++) {
    completedCnt[i] = 0;
  }
  for (let i = 0; i < userLearningInfoArr.length; i++) {
    const userLearningInfo = userLearningInfoArr[i];
    let compCnt = 0;
    for (let i = 0; i < userLearningInfo.projectDetails.length; i++) {
      if (userLearningInfo.projectDetails[i].status == 4) compCnt++;
    }
    completedCnt[compCnt]++;
  }

  let levelsInfo = [0, 0, 0, 0, 0];
  levelsInfo[0] += completedCnt[0] + completedCnt[1];
  levelsInfo[1] += completedCnt[2] + completedCnt[3];
  levelsInfo[2] += completedCnt[4] + completedCnt[5];
  levelsInfo[3] += completedCnt[6] + completedCnt[7] + completedCnt[8];
  levelsInfo[4] += completedCnt[9];
  console.log(levelsInfo);
  res.locals.levelsInfo = levelsInfo;
  next();
};

const getUserSignUpInfo = async (req, res, next) => {
  let signUpArr = [];
  let signUpCategories = [];
  let curr = moment().startOf("day");
  const cnt = await User.find({
    createdAt: {
      $gte: curr.toDate(),
      $lte: moment(curr).endOf("day").toDate(),
    },
  });
  signUpCategories.push(curr.format("DD/MM"));
  signUpArr.push(cnt.length);
  for (let i = 1; i < 5; i++) {
    curr = curr.subtract("1", "days");
    signUpCategories.push(curr.format("DD/MM"));
    const cnt2 = await User.find({
      createdAt: {
        $gte: curr.toDate(),
        $lte: moment(curr).endOf("day").toDate(),
      },
    });
    signUpArr.push(cnt2.length);
  }
  signUpArr.reverse();
  signUpCategories.reverse();
  res.locals.signUpArr = signUpArr;
  res.locals.signUpCategories = signUpCategories;
  next();
};

module.exports = {
  getProjectStatistics,
  getLevelsInfo,
  getUserSignUpInfo,
};

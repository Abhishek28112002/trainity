const LearningTask = require("../models/LearningTask");
const UserLearningInfo = require("../models/UserLearningInfo");
const Metric = require("../models/Metrics");

const getAllLearningTasks = async (req, res, next) => {
  const learningTasksArr = await LearningTask.find({});
  res.locals.learningTasksCnt = learningTasksArr.length;

  // Sorting Learning Tasks with Module Name and days to unlock
  learningTasksArr.sort((a, b) => {
    let fa = a.module.toLowerCase(),
      fb = b.module.toLowerCase();

    if (fa < fb) {
      return -1;
    }
    if (fa > fb) {
      return 1;
    }
    if (fa == fb) {
      if (a.daysAfter < b.daysAfter) {
        return -1;
      }
      if (a.daysAfter > b.daysAfter) {
        return 1;
      }
      return 0;
    }
  });

  req.learningTasksArr = learningTasksArr;
  next();
};

const getRating = async (req, res, next) => {
  const metric = await Metric.findOne({ courseID: 102 });
  res.locals.learningData = metric.learningData;
  console.log(metric.learningData[0]);
  next();
};

module.exports = {
  getAllLearningTasks,
  getRating,
};

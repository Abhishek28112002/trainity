const LiveSession = require("../models/LiveSession");
const Instructor = require("../models/Instructor");

const getAllLiveSessions = async (req, res, next) => {
  const user = req.user;
  const liveSessionArr = await LiveSession.find({ coursCode: user.coursCode });
  req.liveSessionArr = liveSessionArr;
  next();
};

const getAllInstructors = async (req, res, next) => {
  const user = req.user;
  const instructorArr = await Instructor.find({ coursCode: user.coursCode });
  req.instructorArr = instructorArr;
  next();
};

module.exports = {
  getAllLiveSessions,
  getAllInstructors,
};

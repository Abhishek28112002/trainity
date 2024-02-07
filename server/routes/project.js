const express = require("express");
const { ensureAuth, ensureManager } = require("../middleware/auth");

const router = express.Router();
const mongoose = require("mongoose");

const Project = mongoose.model("projects");
const Module = mongoose.model("modules");
const Course = mongoose.model("courses");
const TeachingAssistant = mongoose.model("teachingAssistants");
const ProjectSubmission = mongoose.model("projectSubmissions");

router.get("/create/project", ensureAuth, async (req, res) => {
  const modules = await Module.find({});
  const courses = await Course.find({});
  res.locals.moduleList = modules;
  res.locals.courseList = courses;
  res.render("create-project");
});

router.post("/create/project", ensureAuth, async (req, res) => {
  try {
    const project = await Project.create({
      ...req.body,
      courseID: Number(req.body.courseID),
      projectID: Number(req.body.projectID),
      deadline: Number(req.body.deadline),
      difficulty: Number(req.body.difficulty),
      points: Number(req.body.points),
    });
    console.log(project);
    res.send(project);
  } catch (error) {
    console.log(error);
    res.send({
      error: "Something went wrong",
    });
  }
});


router.get("/create/teachingAssistant", ensureAuth, async (req, res) => {
  const courses = await Course.find({});
  res.locals.courseList = courses;
  res.render("create-teaching-assistant");
});

router.post("/create/teachingAssistant", ensureAuth, async (req, res) => {
  try {
    const teachingAssistant = await TeachingAssistant.create({
      ...req.body,
      courseID: Number(req.body.courseID),
    });
    console.log(teachingAssistant);
    res.send(teachingAssistant);
  } catch (error) {
    console.log(error);
    res.send({
      error: "Something went wrong",
    });
  }
});

router.get("/view/teachingAssistants", ensureAuth, async (req, res) => {
  const teachingAssistants = await TeachingAssistant.find({});
  res.locals.teachingAssistantList = teachingAssistants;

  res.render("view-teaching-assistants");
});

router.delete(
  "/delete/teachingAssistant",
  ensureAuth,
  ensureManager,
  async (req, res) => {
    try {
      const id = req.body.id;
      const teachingAssistant = await TeachingAssistant.findById(id);
      await TeachingAssistant.deleteOne({ _id: id });
      console.log(teachingAssistant);
      res.status(200).send(teachingAssistant);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        error: "Something went wrong",
      });
    }
  }
);

router.get("/check/projects/:courseID", ensureAuth, async (req, res) => {
  const courseID = Number(req.params.courseID);
  // const pendingSubmissions = await ProjectSubmission.find({courseID: courseID, checkDate: -1});
  const projects = await Project.find({ courseID: courseID });
  res.locals.projectList = projects;
  res.render("check-projects.ejs");
});

router.post("/pending/submissions", ensureAuth, async (req, res) => {
  const projectIDArr = req.body.projectIDArr;
  const projects = await Project.find({});

  let projectMap = {};
  for (var project of projects) {
    projectMap[project._id] = project;
  }

  // console.log(projectIDArr);
  let pendingSubmissions = [];

  for (var projectID of projectIDArr) {
    const subList = await ProjectSubmission.find({ checkDate: -1, projectID });
    // console.log(subList);
    pendingSubmissions.push(...subList);
  }

  res.status(200).send({
    projectList: projectMap,
    pendingSubmissions,
  });
});

router.patch("/check/project", ensureAuth, async (req, res) => {
  const { score, feedback, submissionID, taskRating } = req.body;
  const projectSubmission = await ProjectSubmission.findById(submissionID);

  const admin = req.user;

  // console.log(req.body);
  projectSubmission.score = Number(score);
  projectSubmission.checkDate = Date.now();
  projectSubmission.feedback = {
    content: feedback,
    adminID: admin._id,
    rating: 0,
    adminName: admin.displayName,
    adminImage: admin.image,
  };
  projectSubmission.markModified("feedback");
  projectSubmission.taskRating = taskRating;
  projectSubmission.markModified("taskRating");

  // console.log(projectSubmission);

  await projectSubmission.save();

  res.send(projectSubmission);
});

module.exports = router;

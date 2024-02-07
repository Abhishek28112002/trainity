const express = require("express");

const router = express.Router();
const mongoose = require("mongoose");

const Course = mongoose.model("courses");
const Track = mongoose.model("tracks");
const Module = mongoose.model("modules");
const Lesson = mongoose.model("lessons");
const Instructor = mongoose.model("instructors");
const LiveSession = mongoose.model("liveSessions");
const Quiz = mongoose.model("quizes");
const Question = mongoose.model("questions");

const {
  ensureAuth,
  ensureGuest,
  ensureManager,
} = require("../middleware/auth");

router.get("/", ensureAuth, (req, res) => {
  res.render("learning");
});

/**
 *
 * COURSE ROUTES - CRUD
 */

router.get("/create/course", ensureAuth, (req, res) => {
  res.render("create-course");
});

router.post("/create/course", async (req, res) => {
  try {
    const course = await Course.create({
      title: req.body.title,
      courseID: Number(req.body.courseID),
      courseLogo: req.body.courseLogo,
      daysToComplete: Number(req.body.daysToComplete),
    });
    console.log(course);
    res.status(201).send(course);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});

router.get("/view/courses", ensureAuth, async (req, res) => {
  try{
  const courses = await Course.find({});
  res.locals.courseList = courses;

  res.render("view-courses");
  }catch (error) {
    console.error(error);
    res.status(500).send({ status: 500, message: "Server Error" });
  }
});

router.delete("/delete/course", ensureAuth, ensureManager, async (req, res) => {
  try {
    const id = req.body.id;
    const course = await Course.findById(id);
    await Course.deleteOne({ courseID: course.courseID });
    res.status(200).send(course);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});

/**
 *
 * TRACK ROUTES - CRUD
 */

router.get("/create/track", ensureAuth, async (req, res) => {
  const courses = await Course.find({});
  res.locals.courseList = courses;
  res.render("create-track");
});

router.post("/create/track", async (req, res) => {
  try {
    const track = await Track.create({
      title: req.body.title,
      courseID: Number(req.body.courseID),
      trackLogo: req.body.trackLogo,
      domain: req.body.domain,
      trackID: Number(req.body.trackID),
      daysToComplete: Number(req.body.daysToComplete),
      topics: req.body.topics,
    });

    res.status(201).send(track);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});

router.get("/view/tracks", ensureAuth, async (req, res) => {
  try{
  const tracks = await Track.find({});
  res.locals.trackList = tracks;

  res.render("view-tracks");
}catch (error) {
  console.error(error);
  res.status(500).send({ status: 500, message: "Server Error" });
}
});

router.delete("/delete/track", ensureAuth, ensureManager, async (req, res) => {
  try {
    const id = req.body.id;
    const track = await Track.findById(id);
    await Track.deleteOne({ _id: id });
    console.log(track);
    res.status(200).send(track);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});

/**
 *
 * MODULE ROUTES - CRUD
 */

router.get("/create/module", ensureAuth, async (req, res) => {
  try{
  const courses = await Course.find({});
  res.locals.courseList = courses;
  const tracks = await Track.find({});
  res.locals.trackList = tracks;
  res.render("create-module");
}catch (error) {
  console.error(error);
  res.status(500).send({ status: 500, message: "Server Error" });
}
});

router.post("/create/module", async (req, res) => {
  try {
    const module = await Module.create({
      title: req.body.title,
      trackID: req.body.trackID,
      moduleID: Number(req.body.moduleID),
      courseID: Number(req.body.courseID),
      moduleLogo: req.body.moduleLogo,
      duration: req.body.duration,
      daysToComplete: Number(req.body.daysToComplete),
    });

    res.status(201).send(module);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});

router.get("/view/modules", ensureAuth, async (req, res) => {
  try{
  const tracks = await Track.find({});

  const trackList = {};
  for (let i = 0; i < tracks.length; i++) {
    trackList[tracks[i]._id] = tracks[i].title;
  }
  res.locals.trackList = trackList;

  const modules = await Module.find({});
  res.locals.moduleList = modules;

  res.render("view-modules");
}catch (error) {
  console.error(error);
  res.status(500).send({ status: 500, message: "Server Error" });
}
});

router.delete("/delete/module", ensureAuth, ensureManager, async (req, res) => {
  try {
    const id = req.body.id;
    const module = await Module.findById(id);
    await Module.deleteOne({ _id: id });
    console.log(module);
    res.status(200).send(module);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});

/**
 *
 * INSTRUCTOR ROUTES - CRUD
 */

router.get("/create/instructor", ensureAuth, async (req, res) => {
  res.render("create-instructor");
});

router.post("/create/instructor", async (req, res) => {
  try {
    const instructor = await Instructor.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      displayName: req.body.displayName,
      bio: req.body.bio,
      image: req.body.instructorImage,
    });

    res.status(201).send(instructor);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});

router.get("/view/instructors", ensureAuth, async (req, res) => {
  const instructors = await Instructor.find({});
  res.locals.instructorList = instructors;

  res.render("view-instructors");
});

router.delete(
  "/delete/instructor",
  ensureAuth,
  ensureManager,
  async (req, res) => {
    try {
      const id = req.body.id;
      const instructor = await Instructor.findById(id);
      await Instructor.deleteOne({ _id: id });
      console.log(instructor);
      res.status(200).send(instructor);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        error: "Something went wrong",
      });
    }
  }
);

/**
 *
 * LESSON ROUTES - CRUD
 */

router.get("/create/lesson", ensureAuth, async (req, res) => {
  const courses = await Course.find({});
  res.locals.courseList = courses;
  const tracks = await Track.find({});
  res.locals.trackList = tracks;
  const instructors = await Instructor.find({});
  res.locals.instructorList = instructors;

  const modules = await Module.find({});
  res.locals.moduleList = modules;
  res.render("create-lesson");
});

router.post("/create/lesson", async (req, res) => {
  try {
    const lesson = await Lesson.create({
      title: req.body.title,
      courseID: Number(req.body.courseID),
      moduleID: req.body.moduleID,
      lessonID: Number(req.body.lessonID),
      instructorID: req.body.instructorID,
      lessonLogo: req.body.lessonLogo,
      lessonVideo: req.body.lessonVideo,
      duration: Number(req.body.duration),
    });
    console.log(lesson);
    res.status(201).send(lesson);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});

router.get("/view/lessons", ensureAuth, async (req, res) => {
  const modules = await Module.find({});

  const moduleList = {};
  for (let i = 0; i < modules.length; i++) {
    moduleList[modules[i]._id] = modules[i].title;
  }
  res.locals.moduleList = moduleList;

  const lessons = await Lesson.find({});
  res.locals.lessonList = lessons;

  res.render("view-lessons");
});

router.delete("/delete/lesson", ensureAuth, ensureManager, async (req, res) => {
  try {
    const id = req.body.id;
    const lesson = await Lesson.findById(id);
    await Lesson.deleteOne({ _id: id });
    console.log(lesson);
    res.status(200).send(lesson);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});

/**
 *
 * LIVE SESSION ROUTES - CRUD
 */

router.get("/create/session", ensureAuth, async (req, res) => {
  const courses = await Course.find({});
  res.locals.courseList = courses;
  const instructors = await Instructor.find({});
  res.locals.instructorList = instructors;
  res.render("create-live-session");
});

router.post("/create/session", async (req, res) => {
  try {
    const session = await LiveSession.create({
      ...req.body,
      courseID: Number(req.body.courseID),
      sessionID: Number(req.body.sessionID),
      theme: Number(req.body.theme),
    });
    console.log(session);
    res.status(201).send(session);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});

router.get("/view/sessions", ensureAuth, async (req, res) => {
  const sessions = await LiveSession.find({});
  res.locals.sessionList = sessions;

  res.render("view-sessions");
});

router.delete(
  "/delete/session",
  ensureAuth,
  ensureManager,
  async (req, res) => {
    try {
      const id = req.body.id;
      const session = await LiveSession.findById(id);
      await LiveSession.deleteOne({ _id: id });
      console.log(session);
      res.status(200).send(session);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        error: "Something went wrong",
      });
    }
  }
);

/**
 *
 * Quiz + Question ROUTES - CRUD
 */

router.get("/create/quiz", ensureAuth, async (req, res) => {
  const courses = await Course.find({});
  res.locals.courseList = courses;
  const lessons = await Lesson.find({});
  res.locals.lessonList = lessons;
  res.render("create-quiz");
});

router.post("/create/quiz", async (req, res) => {
  try {
    const quiz = await Quiz.create({
      ...req.body,
      courseID: Number(req.body.courseID),
      quizID: Number(req.body.quizID),
      timestamp: Number(req.body.timestamp),
      estimatedTime: Number(req.body.estimatedTime),
    });
    console.log(quiz);
    res.status(201).send(quiz);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});

router.get("/view/quizes", ensureAuth, async (req, res) => {
  const quizes = await Quiz.find({});
  res.locals.quizList = quizes;

  res.render("view-quizes");
});

router.delete("/delete/quiz", ensureAuth, ensureManager, async (req, res) => {
  try {
    const id = req.body.id;
    const quiz = await Quiz.findById(id);
    await Quiz.deleteOne({ _id: id });
    console.log(quiz);
    res.status(200).send(quiz);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});

router.get("/create/question", ensureAuth, async (req, res) => {
  const courses = await Course.find({});
  res.locals.courseList = courses;
  const quizes = await Quiz.find({});
  res.locals.quizList = quizes;
  res.render("create-question");
});

router.post("/create/question", async (req, res) => {
  try {
    const question = await Question.create({
      ...req.body,
      questionID: Number(req.body.questionID),
      estimatedTime: Number(req.body.estimatedTime),
    });
    console.log(question);
    res.status(201).send(question);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});

module.exports = router;

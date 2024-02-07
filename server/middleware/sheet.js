const { google } = require("googleapis");
const User = require("../models/User");
const UserLearningInfo = require("../models/UserLearningInfo");
const Certificate = require("../models/Certificate");
const moment = require("moment");
const { phone } = require("phone");
const UserTaskInfo = require("../models/UserTaskInfo");
const UserCareerTaskInfo = require("../models/UserCareerTaskInfo");
const InternTask = require("../models/InternTask");
const CareerTask = require("../models/CareerTask");
const ProjectSubmission = require("../models/ProjectSubmission");
const e = require("express");
const Project = require("../models/Project");
const { head } = require("../routes/careerTask");
const getAuthSheets = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "./middleware/credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  const client = await auth.getClient();

  const googleSheets = google.sheets({
    version: "v4",
    auth: client,
  });

  const spreadsheetId = "1Im76-WiWeQOuIWUFIl4lbyN0UP2qjmyLbVpBwuyZ1rA";

  return {
    auth,
    client,
    googleSheets,
    spreadsheetId,
  };
};

const getSheetName = (courseCode) => {
  if (courseCode == 101) return "Marketing Master";
  else return "Master New";
};

const getInternSheetName = (courseCode) => {
  if (courseCode == 101) return "Intern-Task-Marketing";
  else return "Intern-Task-Data";
};

const getCareerSheetName = (courseCode) => {
  if (courseCode == 101) return "Career-Task-Marketing";
  return "Career-Task-Data";
};

const getRows = async (courseCode) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const sheetName = getSheetName(courseCode);
  try {
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${sheetName}`,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });
    let rows = getRows.data.values;
    let headersArr = rows[0];
    let headers = new Map();
    for (let i = 0; i < headersArr.length; i++) {
      headers.set(headersArr[i], i);
    }
    return {
      headers,
      rows,
    };
  } catch (error) {
    console.log(error);
    return [];
  }
};

const getHeaders = async (courseCode) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const sheetName = getSheetName(courseCode);
  try {
    const headersResponse = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${sheetName}!A1:BX1`,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });

    const headersArr = headersResponse.data.values[0];
    const headers = new Map();

    for (let i = 0; i < headersArr.length; i++) {
      headers.set(headersArr[i], i);
    }
    return headers;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const getSheetUser = async (email, courseCode) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const sheetName = getSheetName(courseCode);
  try {
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${sheetName}`,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });
    let rows = getRows.data.values;

    let id = -1;
    let userRow = [];
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][1] === email) {
        id = i;
        userRow = rows[i];
        break;
      }
    }
    return {
      sheetID: id + 1,
      userRow,
    };
  } catch (error) {
    console.log(error);
    return -1;
  }
};

const getUserByID = async (userIndex, courseCode) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const sheetName = getSheetName(courseCode);
  const sheetRange = `${sheetName}!A${userIndex}:BX${userIndex}`;

  const getRowResponse = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: sheetRange,
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  const userRow = getRowResponse.data.values[0];

  return userRow;
};

const updateProject = async (
  projectID,
  driveLink,
  daysPassed,
  userIndex,
  courseCode
) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const link = "Link-" + projectID;
  const feedback = "Feedback-" + projectID;
  const status = "Status-" + projectID;
  const days = "Days-" + projectID;
  const plag = "Plagiarism-" + projectID;
  const score = "Score-" + projectID;

  const sheetName = getSheetName(courseCode);

  const sheetRange = `${sheetName}!A${userIndex}:BX${userIndex}`;

  console.log(link, feedback, status, days, sheetRange);

  const getRowResponse = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: sheetRange,
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  const userRow = getRowResponse.data.values[0];

  const headers = await getHeaders();

  const linkID = headers.get(link);
  const feedbackID = headers.get(feedback);
  const statusID = headers.get(status);
  const daysID = headers.get(days);
  const plagID = headers.get(plag);
  const scoreID = headers.get(score);

  userRow[linkID] = driveLink;
  userRow[feedbackID] = "";
  userRow[statusID] = "REVIEW";
  userRow[daysID] = daysPassed;
  userRow[plagID] = "";
  userRow[scoreID] = "";

  try {
    const updateValue = await googleSheets.spreadsheets.values.update({
      spreadsheetId,
      range: sheetRange,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [userRow],
      },
    });

    return updateValue;
  } catch (error) {
    console.log(error);
    return { status: "Error" };
  }
};

const updateUser = async (email, fullName, userIndex, courseCode) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const sheetName = getSheetName(courseCode);
  const sheetRange = `${sheetName}!A${userIndex}:BX${userIndex}`;

  const headers = await getHeaders();

  const emailID = headers.get("Email");
  const signUpStatusID = headers.get("Sign Up Status");
  const fullNameID = headers.get("Full Name");

  const getRowResponse = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: sheetRange,
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  const userRow = getRowResponse.data.values[0];

  userRow[emailID] = email;
  userRow[fullNameID] = fullName;
  userRow[signUpStatusID] = true;

  try {
    const updateValue = await googleSheets.spreadsheets.values.update({
      spreadsheetId,
      range: sheetRange,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [userRow],
      },
    });

    return updateValue;
  } catch (error) {
    console.log(error);
    return { status: "Error" };
  }
};

const updateUserProfile = async (email, updateBody, userIndex, courseCode) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const sheetName = getSheetName(courseCode);
  const sheetRange = `${sheetName}!A${userIndex}:BX${userIndex}`;

  // const userProfile = req.userProfile;
  const updates = Object.keys(updateBody);

  const headers = await getHeaders();

  console.log(headers);
  // let updateIDs = [];
  // const  = headers.get("Email");
  const signUpStatusID = headers.get("Sign Up Status");
  const fullNameID = headers.get("Full Name");

  const getRowResponse = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: sheetRange,
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  const userRow = getRowResponse.data.values[0];

  console.log(userRow);
  console.log(updates);

  let updateIDs = [];

  updates.forEach((update) => {
    if (update == "fullName") {
      const id = headers.get("Full Name");
      userRow[id] = updateBody[update];
    } else if (update == "college") {
      const id = headers.get("College");
      userRow[id] = updateBody[update];
    } else if (update == "graduationYear") {
      const id = headers.get("Graduation Year");
      userRow[id] = updateBody[update];
    } else if (update == "portfolioLink") {
      const id = headers.get("Portfolio Link");
      userRow[id] = updateBody[update];
    } else if (update == "linkedinLink") {
      const id = headers.get("LinkedIn Link");
      userRow[id] = updateBody[update];
    } else if (update == "firstName") {
      const id = headers.get("Full Name");
      userRow[id] = updateBody[update];
    }
  });
  try {
    const updateValue = await googleSheets.spreadsheets.values.update({
      spreadsheetId,
      range: sheetRange,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [userRow],
      },
    });

    return updateValue;
  } catch (error) {
    console.log(error);
    return { status: "Error" };
  }
};

const updateProjectStatus = async (courseCode) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const sheetName = getSheetName(courseCode);

  try {
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${sheetName}`,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });

    let rows = getRows.data.values;

    let headersArr = rows[0];
    let headers = new Map();
    for (let i = 0; i < headersArr.length; i++) {
      headers.set(headersArr[i], i);
    }
    const emailIndex = headers.get("Email ID");
    const paymentIndex = headers.get("Payment_ID");
    const phoneIndex = headers.get("phone_no");
    for (let i = 1; i < rows.length; i++) {
      const email = rows[i][emailIndex];
      // console.log(email);

      const user = await User.findOne({ email: email });
      // const sub = await ProjectSubmission.find({ userID: user.googleID });
      // console.log(sub);

      // console.log(user);
      if (user) {
        let userLearningInfo = await UserLearningInfo.findOne({
          userID: user.googleID,
        });
        // console.log(userLearningInfo.projectDetails);
        if (userLearningInfo) {
          let cntCompleted = 0;
          for (let j = 0; j < userLearningInfo.projectDetails.length; j++) {
            const statusField = "Status-" + Number(j + 1);
            const feedbackField = "Feedback-" + Number(j + 1);
            const linkField = "Link-" + Number(j + 1);
            const plagField = "Plagiarism-" + Number(j + 1);
            const scoreField = "Score-" + Number(j + 1);

            const status = rows[i][headers.get(statusField)];
            const feedback = rows[i][headers.get(feedbackField)];
            const link = rows[i][headers.get(linkField)];
            const plag = rows[i][headers.get(plagField)];
            const score = rows[i][headers.get(scoreField)];

            // console.log(updateValue);

            // console.log(i, j, status, feedback, link, score, plag);
            if (score && link && plag) {
              const projectSubmissions = await ProjectSubmission.find({
                userID: user.googleID,
                projectID: j + 1,
              });
              console.log(projectSubmissions);
              if (projectSubmissions.length > 0) {
                // console.log(email, "EXIST");
                projectSubmissions.sort((a, b) => {
                  return b.subId - a.subId;
                });
                const scoreMap = new Map([
                  ["PERFECT", 5],
                  ["GREAT", 4],
                  ["GOOD", 3],
                  ["OKAY", 2],
                  ["POOR", 1],
                  ["REJECTED", -1],
                ]);
                const plagMap = new Map([
                  ["CRITICAL", 3],
                  ["HIGH", 2],
                  ["LOW", 1],
                  ["NONE", 0],
                ]);

                projectSubmissions[0].plagCheck = plagMap.get(plag);
                projectSubmissions[0].subScore = scoreMap.get(score);
                projectSubmissions[0].feedback = feedback;
                if (projectSubmissions[0].checkDate == "-1") {
                  console.log("HERE");
                  projectSubmissions[0].checkDate = Date.now;
                }

                if (projectSubmissions[0].subScore >= 1) cntCompleted++;

                await projectSubmissions[0].save();
              }
            } else {
              // console.log(email);
            }
          }
          console.log(cntCompleted);

          const userCareerTaskInfo = await UserCareerTaskInfo.findOne({
            userID: user.googleID,
          });
          if (
            cntCompleted === 9 &&
            (!userCareerTaskInfo || userCareerTaskInfo.allowed == 0)
          ) {
            await addRowinCareerSheet(
              rows[i][paymentIndex],
              email,
              rows[i][phoneIndex],
              102
            );
          } else if (userCareerTaskInfo && userCareerTaskInfo.allowed == 1) {
            console.log("already alloted", email);
          }

          userLearningInfo.markModified("projectInfo");
          await userLearningInfo.save();
        }
      }

      console.log(i, email, "done");
    }
  } catch (error) {
    console.log(error);
    return [];
  }
};

const checkPhone = async (phoneNum, courseCode) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const sheetName = getSheetName(courseCode);
  const userPhone = phone(phoneNum.toString(), { country: "IN" });
  try {
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${sheetName}`,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });
    let rows = getRows.data.values;

    let id = -1;
    let userRow = [];
    for (let i = 0; i < rows.length; i++) {
      const sheetPhone = phone(rows[i][2].toString(), { country: "IN" });
      if (sheetPhone.phoneNumber === userPhone.phoneNumber) {
        id = i;
        userRow = rows[i];
        break;
      }
    }
    return {
      sheetID: id + 1,
      userRow,
    };
  } catch (error) {
    console.log(error);
    return -1;
  }
};

const updateCertificateStatus = async (courseCode) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const sheetName = getSheetName(courseCode);
  try {
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${sheetName}`,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });

    let rows = getRows.data.values;

    let headersArr = rows[0];
    let headers = new Map();
    for (let i = 0; i < headersArr.length; i++) {
      headers.set(headersArr[i], i);
    }
    const emailIndex = headers.get("Email ID");
    const trainingIndex = headers.get("Training Certificate");
    const internIndex = headers.get("Internship Certificate");
    console.log(trainingIndex, internIndex);
    for (let i = 0; i < rows.length; i++) {
      const email = rows[i][emailIndex];
      // console.log(email);

      const user = await User.findOne({ email: email });
      // console.log(user);
      if (user) {
        const userCertificate = await Certificate.findOne({
          userID: user.googleID,
        });
        if (userCertificate) {
          let trainingFlag = 0;
          let internFlag = 0;
          if (rows[i][trainingIndex] == "APPROVED") trainingFlag = 1;
          if (rows[i][internIndex] == "APPROVED") internFlag = 1;

          let dateString = moment().format("DD-MM-YYYY");

          if (trainingFlag && internFlag) {
            userCertificate.alloted = 3;
            if (userCertificate.date == "dd-mm-yyyy")
              userCertificate.date = dateString;
            if (userCertificate.date2 == "dd-mm-yyyy")
              userCertificate.date2 = dateString;
          } else if (trainingFlag) {
            userCertificate.alloted = 1;
            if (userCertificate.date2 == "dd-mm-yyyy")
              userCertificate.date2 = dateString;
          } else if (internFlag) {
            userCertificate.alloted = 2;
            if (userCertificate.date1 == "dd-mm-yyyy")
              userCertificate.date1 = dateString;
          } else userCertificate.alloted = 0;

          // dateString = dateString[2] + " " + dateString[1];
          await userCertificate.save();

          if (trainingFlag | internFlag) {
            console.log(userCertificate);
          }
          console.log(email, "done");
        }
      }
    }
  } catch (error) {
    console.log(error);
    return [];
  }
};

const updateTaskStatus = async (courseCode) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const sheetName = getInternSheetName(courseCode);
  try {
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${sheetName}`,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });

    let rows = getRows.data.values;

    let headersArr = rows[0];
    let headers = new Map();
    for (let i = 0; i < headersArr.length; i++) {
      headers.set(headersArr[i], i);
    }
    const emailIndex = headers.get("Email ID");

    for (let i = 1; i < rows.length; i++) {
      const email = rows[i][emailIndex];
      console.log(email);

      const user = await User.findOne({ email: email });
      if (user) {
        const userTaskInfo = await UserTaskInfo.findOne({
          userID: user.googleID,
        });
        if (userTaskInfo) {
          userTaskInfo.allowed = 1;
          userTaskInfo.taskSheetId = i;
          await userTaskInfo.save();
          console.log(userTaskInfo);
        }
      }
    }
  } catch (error) {
    console.log(error);
    return [];
  }
};

const submitInternTask = async (
  email,
  taskSheetId,
  internTaskID,
  internTaskType,
  driveLink,
  courseCode
) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const sheetName = getInternSheetName(courseCode);

  try {
    const headersResponse = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${sheetName}!A1:AH1`,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });

    const headersArr = headersResponse.data.values[0];
    const headers = new Map();

    for (let i = 0; i < headersArr.length; i++) {
      headers.set(headersArr[i], i);
    }

    const emailIndex = headers.get("Email ID");
    let taskType = "Mandatory";
    if (internTaskType.includes("Optional")) taskType = "Optional";

    const linkIndex = headers.get(`${taskType}-Link-${internTaskID}`);
    const statusIndex = headers.get(`${taskType}-Status-${internTaskID}`);
    const feedbackIndex = headers.get(`${taskType}-Feedback-${internTaskID}`);

    const sheetRange = `${sheetName}!A${taskSheetId + 1}:AH${taskSheetId + 1}`;

    const getRowResponse = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: sheetRange,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });

    const userRow = getRowResponse.data.values[0];
    userRow[linkIndex] = driveLink;
    userRow[feedbackIndex] = "";
    userRow[statusIndex] = "REVIEW";

    const updateValue = await googleSheets.spreadsheets.values.update({
      spreadsheetId,
      range: sheetRange,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [userRow],
      },
    });

    return updateValue;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const updateUserTaskSubmissions = async (courseCode) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const sheetName = getInternSheetName(courseCode);

  try {
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${sheetName}`,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });

    let rows = getRows.data.values;

    let headersArr = rows[0];
    let headers = new Map();
    for (let i = 0; i < headersArr.length; i++) {
      headers.set(headersArr[i], i);
    }
    console.log(headers);
    const emailIndex = headers.get("Email ID");
    for (let i = 1; i < rows.length; i++) {
      const email = rows[i][emailIndex];
      // console.log(email);

      const user = await User.findOne({ email: email });
      if (user) {
        let userTaskInfo = await UserTaskInfo.findOne({
          userID: user.googleID,
        });
        // console.log(rows[i]);
        if (userTaskInfo) {
          const internTasksArr = await InternTask.find({});
          const submittedTasks = [];
          for (let j = 0; j < internTasksArr.length; j++) {
            const internTask = internTasksArr[j]._id;
            const internTaskID = internTasksArr[j].taskID;
            const internTaskType = internTasksArr[j].taskType;
            let taskType = "Mandatory";
            if (internTaskType == 0) taskType = "Optional";
            const linkIndex = headers.get(`${taskType}-Link-${internTaskID}`);
            const statusIndex = headers.get(
              `${taskType}-Status-${internTaskID}`
            );
            const feedbackIndex = headers.get(
              `${taskType}-Feedback-${internTaskID}`
            );
            const status = rows[i][statusIndex];
            const feedback = rows[i][feedbackIndex];
            const link = rows[i][linkIndex];
            if (status && link) {
              if (status == "APPROVED") {
                if (
                  userTaskInfo.completedTasks.indexOf(internTask.toString()) ==
                  -1
                )
                  userTaskInfo.completedTasks.push(internTask.toString());
              } else if (status == "REJECTED") {
                const exist = userTaskInfo.notApprovedTasks.find(
                  (task) => task.id == internTask.toString()
                );
                if (!exist) {
                  userTaskInfo.notApprovedTasks.push({
                    id: internTask.toString(),
                    feedback,
                  });
                }
              } else if (status == "REVIEW")
                submittedTasks.push(internTask.toString());
            } else {
              // console.log(email);
            }
          }
          userTaskInfo.submittedTasks = submittedTasks;
          await userTaskInfo.save();
        }
        console.log(userTaskInfo);
      }

      console.log(email, "done");
    }
  } catch (error) {
    console.log(error);
    return [];
  }
};

const updateCareerTaskStatus = async (courseCode) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const sheetName = getCareerSheetName(courseCode);
  try {
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${sheetName}`,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });

    let rows = getRows.data.values;

    let headersArr = rows[0];
    let headers = new Map();
    for (let i = 0; i < headersArr.length; i++) {
      headers.set(headersArr[i], i);
    }
    const emailIndex = headers.get("Email ID");

    for (let i = 1; i < rows.length; i++) {
      const email = rows[i][emailIndex];
      console.log(email);
      const user = await User.findOne({ email: email });
      if (user) {
        let userCareerTaskInfo = await UserCareerTaskInfo.findOne({
          userID: user.googleID,
        });
        if (userCareerTaskInfo) {
          userCareerTaskInfo.allowed = 1;
          userCareerTaskInfo.taskSheetId = i;
          await userCareerTaskInfo.save();
        } else {
          const userCareerTaskInfoObj = {
            userID: user.googleID,
            allowed: 1,
            taskSheetId: i,
          };
          userCareerTaskInfo = await UserCareerTaskInfo.create(
            userCareerTaskInfoObj
          );
        }
      }
    }
  } catch (error) {
    console.log(error);
    return [];
  }
};

const submitCareerTask = async (
  email,
  taskSheetId,
  taskID,
  driveLink,
  courseCode
) => {
  console.log(email, taskSheetId, taskID, driveLink, courseCode);

  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const sheetName = getCareerSheetName(courseCode);

  try {
    const headersResponse = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${sheetName}!A1:AC1`,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });

    const headersArr = headersResponse.data.values[0];
    const headers = new Map();

    for (let i = 0; i < headersArr.length; i++) {
      headers.set(headersArr[i], i);
    }
    const emailIndex = headers.get("Email ID");

    const linkIndex = headers.get(`Link-${taskID}`);
    const statusIndex = headers.get(`Status-${taskID}`);
    const feedbackIndex = headers.get(`Feedback-${taskID}`);

    const sheetRange = `${sheetName}!A${taskSheetId + 1}:AC1${taskSheetId + 1}`;

    const getRowResponse = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: sheetRange,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });

    const userRow = getRowResponse.data.values[0];
    userRow[linkIndex] = driveLink;
    userRow[feedbackIndex] = "";
    userRow[statusIndex] = "REVIEW";

    const updateValue = await googleSheets.spreadsheets.values.update({
      spreadsheetId,
      range: sheetRange,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [userRow],
      },
    });

    return updateValue;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const updateCareerTaskSubmissions = async (courseCode) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const sheetName = getCareerSheetName(courseCode);

  try {
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${sheetName}`,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });

    let rows = getRows.data.values;

    let headersArr = rows[0];
    let headers = new Map();
    for (let i = 0; i < headersArr.length; i++) {
      headers.set(headersArr[i], i);
    }
    const emailIndex = headers.get("Email ID");
    for (let i = 1; i < rows.length; i++) {
      const email = rows[i][emailIndex];
      // console.log(email);

      const user = await User.findOne({ email: email });
      if (user) {
        let userCareerTaskInfo = await UserCareerTaskInfo.findOne({
          userID: user.googleID,
        });

        // console.log(rows[i]);
        if (userCareerTaskInfo) {
          const careerTasksArr = await CareerTask.find({});
          let submittedTasks = [];
          let completedTasks = [];
          let notApprovedTasks = [];
          for (let j = 0; j < careerTasksArr.length; j++) {
            const careerTask = careerTasksArr[j]._id;
            const careerTaskID = careerTasksArr[j].taskID;
            const linkIndex = headers.get(`Link-${careerTaskID}`);
            const statusIndex = headers.get(`Status-${careerTaskID}`);
            const feedbackIndex = headers.get(`Feedback-${careerTaskID}`);
            const status = rows[i][statusIndex];
            const feedback = rows[i][feedbackIndex];
            const link = rows[i][linkIndex];
            // console.log(rows[i]);
            if (status && link) {
              if (status == "APPROVED") {
                completedTasks.push(careerTask.toString());
              } else if (status == "REJECTED") {
                notApprovedTasks.push({
                  id: careerTask.toString(),
                  feedback,
                });
              } else if (status == "REVIEW") {
                submittedTasks.push(careerTask.toString());
              }
            } else {
              // console.log(email);
            }
          }

          userCareerTaskInfo.submittedTasks = submittedTasks;
          userCareerTaskInfo.completedTasks = completedTasks;
          userCareerTaskInfo.notApprovedTasks = notApprovedTasks;
          await userCareerTaskInfo.save();
          // console.log(userCareerTaskInfo);
        }
      }

      console.log(email, "done");
    }
  } catch (error) {
    console.log(error);
    return [];
  }
};

const checkAlreadyRegistered = async (name, emailID, group) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const sheetName = "Attendees";

  try {
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${sheetName}`,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });

    let rows = getRows.data.values;

    let headersArr = rows[0];
    let headers = new Map();
    for (let i = 0; i < headersArr.length; i++) {
      headers.set(headersArr[i], i);
    }
    const emailIndex = headers.get("Email");
    for (let i = 1; i < rows.length; i++) {
      const email = rows[i][emailIndex];
      if (email == emailID)
        return {
          status: "400",
        };
    }
    return {
      status: "200",
    };
  } catch (error) {
    console.log(error);
    return {
      status: "400",
    };
  }
};

const addRowinCareerSheet = async (paymentID, emailID, phone, courseCode) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const sheetName = getCareerSheetName(courseCode);

  try {
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${sheetName}`,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });

    let rows = getRows.data.values;
    const sheetRange = `${sheetName}!A${rows.length + 1}:C${rows.length + 1}`;
    const appendValue = await googleSheets.spreadsheets.values.append({
      spreadsheetId,
      range: sheetRange,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[paymentID, emailID, phone]],
      },
    });

    const user = await User.findOne({ email: emailID });
    if (user) {
      let userCareerTaskInfo = await UserCareerTaskInfo.findOne({
        userID: user.googleID,
      });
      if (userCareerTaskInfo) {
        userCareerTaskInfo.allowed = 1;
        userCareerTaskInfo.taskSheetId = rows.length;
        await userCareerTaskInfo.save();
      } else {
        const userCareerTaskInfoObj = {
          userID: user.googleID,
          allowed: 1,
          taskSheetId: rows.length,
        };
        userCareerTaskInfo = await UserCareerTaskInfo.create(
          userCareerTaskInfoObj
        );
      }
    }

    return {
      status: "200",
    };
  } catch (error) {
    console.log(error);
    return {
      status: "400",
    };
  }
};

const registerForWebinar = async (name, emailID, group, sheetName) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  try {
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${sheetName}`,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });

    let rows = getRows.data.values;

    const sheetRange = `${sheetName}!A${rows.length + 1}:C${rows.length + 1}`;
    const appendValue = await googleSheets.spreadsheets.values.append({
      spreadsheetId,
      range: sheetRange,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[name, emailID, group]],
      },
    });
    return {
      status: "200",
    };
  } catch (error) {
    console.log(error);
    return {
      status: "400",
    };
  }
};

const updateRefundEligibility = async (
  emailID,
  userIndex,
  courseCode,
  eligible
) => {
  console.log(emailID, userIndex, courseCode);
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const sheetName = getSheetName(courseCode);

  try {
    const headersResponse = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${sheetName}!A1:BX1`,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });

    const headersArr = headersResponse.data.values[0];
    const headers = new Map();

    for (let i = 0; i < headersArr.length; i++) {
      headers.set(headersArr[i], i);
    }
    const emailIndex = headers.get("Email ID");

    const refundEligibilityIndex = headers.get("Refund Eligibility");

    const sheetRange = `${sheetName}!A${userIndex}:BX${userIndex}`;

    const getRowResponse = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: sheetRange,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });

    const userRow = getRowResponse.data.values[0];
    if (eligible) {
      userRow[refundEligibilityIndex] = "ELIGIBLE";
    } else userRow[refundEligibilityIndex] = "NOT ELIGIBLE";

    const updateValue = await googleSheets.spreadsheets.values.update({
      spreadsheetId,
      range: sheetRange,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [userRow],
      },
    });

    return updateValue;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const claimRefund = async (emailID, userIndex, courseCode) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const sheetName = getSheetName(courseCode);

  try {
    const headersResponse = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${sheetName}!A1:BX1`,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });

    const headersArr = headersResponse.data.values[0];
    const headers = new Map();

    for (let i = 0; i < headersArr.length; i++) {
      headers.set(headersArr[i], i);
    }
    const emailIndex = headers.get("Email ID");

    const refundStatusIndex = headers.get("Refund Status");

    const sheetRange = `${sheetName}!A${userIndex}:BX${userIndex}`;

    const getRowResponse = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: sheetRange,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });

    const userRow = getRowResponse.data.values[0];
    userRow[refundStatusIndex] = "APPLIED";

    const updateValue = await googleSheets.spreadsheets.values.update({
      spreadsheetId,
      range: sheetRange,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [userRow],
      },
    });

    return updateValue;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const updateRefundStatus = async (courseCode) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const sheetName = getSheetName(courseCode);

  try {
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${sheetName}`,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });

    let rows = getRows.data.values;

    let headersArr = rows[0];
    let headers = new Map();
    for (let i = 0; i < headersArr.length; i++) {
      headers.set(headersArr[i], i);
    }
    const emailIndex = headers.get("Email ID");
    for (let i = 1; i < rows.length; i++) {
      const email = rows[i][emailIndex];
      // console.log(email);

      const user = await User.findOne({ email: email });
      if (user) {
        const refundEligibilityIndex = headers.get("Refund Status");
        const refundCommentIndex = headers.get("Refund Comments");
        if (rows[i][refundEligibilityIndex] == "APPLIED") {
          user.refundStatus = 1;
          user.refundComment = rows[i][refundCommentIndex];
        } else if (rows[i][refundEligibilityIndex] == "REFUNDED") {
          user.refundStatus = 2;
          user.refundComment = rows[i][refundCommentIndex];
          console.log(email);
        } else if (rows[i][refundEligibilityIndex] == "NOT ELIGIBLE") {
          user.refundStatus = 3;
          user.refundComment = rows[i][refundCommentIndex];
        } else {
          user.refundStatus = 0;
          user.refundComment = rows[i][refundCommentIndex];
        }
        await user.save();
        // console.log(email, user.refundStatus);
      }

      // console.log(email, "done");
    }
  } catch (error) {
    console.log(error);
    return [];
  }
};

// Code to create project submission

const createProjectSubmissions = async (email) => {
  const user = await User.findOne({ email });
  const userLearningInfo = await UserLearningInfo.findOne({
    userID: user.googleID,
  });
  const projectArr = await Project.find({});
  projectArr.sort((a, b) => {
    return a.projectID - b.projectID;
  });
  const userRow = await getUserByID(user.sheetID, user.courseCode);
  const headers = await getHeaders(user.courseCode);

  if (userLearningInfo) {
    for (let i = 0; i < projectArr.length; i++) {
      const projectId = projectArr[i].projectID;
      const projectInfo = userLearningInfo.projectInfo[i];
      // console.log(projectInfo);
      const feedbackField = "Feedback-" + Number(projectId);
      const linkField = "Link-" + Number(projectId);
      const daysField = "Days-" + Number(projectId);

      const feedback = userRow[headers.get(feedbackField)];
      const link = userRow[headers.get(linkField)];
      let days = userRow[headers.get(daysField)];

      if (link) {
        days = 0;
        const submitTime = moment(user.createdAt).add(days, "days").unix();
        let subCnt = projectInfo.subCnt;
        if (subCnt == 0) subCnt = 1;
        let subScore = 0;
        if (projectInfo.status == 3) subScore = -1;
        else if (projectInfo.status == 4) subScore = 5;

        const projectSubmission = {
          userID: user.googleID,
          projectID: projectId,
          courseCode: user.courseCode,
          date: submitTime * 1000,
          subLink: link,
          subId: 1,
          plagCheck: 0,
          subScore,
          feedback,
          checkDate: projectInfo.approvedDate,
        };
        const subExist = await ProjectSubmission.findOne({
          userID: user.googleID,
          projectID: projectId,
          subId: subCnt,
        });
        if (!subExist) {
          const submission = await ProjectSubmission.create(projectSubmission);
          console.log(submission);
        } else {
          subExist.checkDate = projectInfo.approvedDate;
          await subExist.save();
        }
      }
    }
  }
};

// (async () => {
//   await createProjectSubmissions("manavnarula23@gmail.com");
// })();

// (async () => {
//   // const user = await User.findOne({ email: "pranaykandikonda@gmail.com" });
//   // const deletedSub = await ProjectSubmission.deleteMany({
//   //   userID: user.googleID,
//   // });
//   // await createProjectSubmissions("pranaykandikonda@gmail.com");
// })();

// (async () => {
//   await updateRefundStatus("102");
// })();
// (async () => {
//   // const res = await updateRefundEligibility("adityaagr00@gmail.com", 5, 102, 0);
//   // console.log(res);
//   // let dateString = moment().toString();
//   // dateString = dateString.split(" ");
//   // console.log(dateString);
//   // dateString = dateString[2] + " " + dateString[1] + " " + dateString[3];
//   // console.log(dateString);
//   const users = await User.find({});
//   for (let i = 0; i < users.length; i++) {
//     const user = users[i];
//     const userLearningInfo = await UserLearningInfo.findOne({
//       userID: user.googleID,
//     });
//     if (userLearningInfo) {
//       for (let i = 0; i < userLearningInfo.projectInfo.length; i++) {
//         let str = userLearningInfo.projectInfo[i].approvedDate.split(" ");
//         if (
//           userLearningInfo.projectInfo[i].approvedDate != "NA" &&
//           str.length < 3
//         )
//           userLearningInfo.projectInfo[i].approvedDate += " 2022";
//         console.log(user.email);
//       }
//       userLearningInfo.markModified("projectInfo");
//       await userLearningInfo.save();
//     }
//   }
// })();

// (async () => {
//   const email = "adityaagr00@gmail.com";
//   const user = await User.findOne({ email: email });
//   const userLearningInfo = await UserLearningInfo.findOne({
//     userID: user.googleID,
//   });
//   const courseCode = user.courseCode;
//   const userIndex = user.sheetID;
//   const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
//   const sheetName = getSheetName(courseCode);
//   const sheetRange = `${sheetName}!A${userIndex}:BX${userIndex}`;

//   const headers = await getHeaders();

//   // let updateIDs = [];
//   // const  = headers.get("Email");

//   const getRowResponse = await googleSheets.spreadsheets.values.get({
//     auth,
//     spreadsheetId,
//     range: sheetRange,
//     valueRenderOption: "UNFORMATTED_VALUE",
//     dateTimeRenderOption: "FORMATTED_STRING",
//   });

//   const userRow = getRowResponse.data.values[0];
//   // console.log(userRow);

//   for (let i = 0; i < userLearningInfo.projectInfo.length; i++) {
//     const submission = userLearningInfo.projectInfo[i];

//     const isExist = await ProjectSubmission.findOne({
//       projectID: submission.projectID,
//       userID: user.googleID,
//       courseCode: user.courseCode,
//     });
//     const linkIndex = headers.get(`Link-${i + 1}`);
//     const statusIndex = headers.get(`Status-${i + 1}`);
//     const feedbackIndex = headers.get(`Feedback-${i + 1}`);
//     const daysIndex = headers.get(`Days-${i + 1}`);
//     const subLink = userRow[linkIndex];
//     const feedback = userRow[feedbackIndex];
//     const daysSpent = userRow[daysIndex];
//     let subDate;
//     if (submission.daysSpent != 0)
//       subDate = moment().add(submission.daysSpent, "days");
//     else if (daysSpent) {
//       subDate = moment().add(Number(submission.daysSpent), "days");
//     }
//     if (!isExist) {
//       let projectSubmissionObject = null;
//       if (submission.subLink) {
//         projectSubmissionObject = {
//           userID: user.googleID,
//           projectID: submission.projectID,
//           courseCode: user.courseCode,
//           date: subDate,
//           subLink: submission.subLink,
//           subCnt: submission.subCnt,
//           feedback: feedback,
//           subScore: 5,
//         };
//       } else if (subLink) {
//         projectSubmissionObject = {
//           userID: user.googleID,
//           projectID: submission.projectID,
//           courseCode: user.courseCode,
//           date: subDate,
//           subLink: subLink,
//           subCnt: Math.max(submission.subCnt, 1),
//           feedback: feedback,
//           subScore: 5,
//         };
//       }
//       if (projectSubmissionObject != null) {
//         const sub = await ProjectSubmission.create(projectSubmissionObject);
//         console.log(sub);
//       }
//     }
//   }
// })();

// (async () => {
//   const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
//   const sheetName = getSheetName(102);
//   try {
//     const getRows = await googleSheets.spreadsheets.values.get({
//       auth,
//       spreadsheetId,
//       range: `${sheetName}`,
//       valueRenderOption: "UNFORMATTED_VALUE",
//       dateTimeRenderOption: "FORMATTED_STRING",
//     });
//     let rows = getRows.data.values;
//     // console.log(rows[4]);
//     // console.log(rows[0]);
//     let id = -1;
//     let cnt = 0;
//     let userRow = [];
//     for (let i = 1; i < rows.length; i++) {
//       const email = rows[i][1];
//       const user = await User.findOne({ email });

//       if (user) {
//         if (user.sheetID != i + 1) {
//           if (user.sheetID > 1 && rows[user.sheetID - 1][1] != email) {
//             console.log(email);
//             user.sheetID = i + 1;
//             await user.save();
//             console.log(user.email, `${user.sheetID} -> ${i + 1}`);
//           } else {
//             console.log("EXIST", email, user.sheetID);
//           }

//           cnt++;
//         }
//       }
//     }
//     console.log("CNT", cnt);
//   } catch (error) {
//     console.log(error);
//     return -1;
//   }
// })();

// (async () => {
//   const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
//   const sheetName = getSheetName(102);
//   try {
//     const getRows = await googleSheets.spreadsheets.values.get({
//       auth,
//       spreadsheetId,
//       range: `${sheetName}`,
//       valueRenderOption: "UNFORMATTED_VALUE",
//       dateTimeRenderOption: "FORMATTED_STRING",
//     });
//     let rows = getRows.data.values;
//     // console.log(rows[4]);
//     // console.log(rows[0]);
//     let id = -1;
//     let cnt = 0;
//     let userRow = [];
//     for (let i = 5942; i < rows.length; i++) {
//       const email = rows[i][1];

//       const user = await User.findOne({ email });
//       if (user && user.courseCode == 102) {
//         await createProjectSubmissions(email);
//         console.log(i, email);
//       }

//       // if (user) {
//       //   if (user.sheetID != i + 1) {
//       //     if (user.sheetID > 1 && rows[user.sheetID - 1][1] != email) {
//       //       console.log(email);
//       //       user.sheetID = i + 1;
//       //       await user.save();
//       //       console.log(user.email, `${user.sheetID} -> ${i + 1}`);
//       //     } else {
//       //       console.log("EXIST", email, user.sheetID);
//       //     }

//       //     cnt++;
//       //   }
//       // }
//     }
//   } catch (error) {
//     console.log(error);
//     return -1;
//   }
// })();

module.exports = {
  getRows,
  getHeaders,
  updateProject,
  getSheetUser,
  updateUser,
  updateProjectStatus,
  updateUserProfile,
  checkPhone,
  getUserByID,
  updateCertificateStatus,
  updateTaskStatus,
  submitInternTask,
  updateUserTaskSubmissions,
  updateCareerTaskStatus,
  submitCareerTask,
  updateCareerTaskSubmissions,
  checkAlreadyRegistered,
  registerForWebinar,
  updateRefundEligibility,
  claimRefund,
  updateRefundStatus,
  createProjectSubmissions,
  addRowinCareerSheet,
};

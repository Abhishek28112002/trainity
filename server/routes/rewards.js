const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const moment = require("moment");
const axios = require("axios");
const XLSX = require("xlsx");
const Excel = require("exceljs");
const {
  ensureGuest,
  ensureAuth,
  ensureManager,
} = require("../middleware/auth");
const Admin = mongoose.model("admins");
const Level = mongoose.model("levels");
const Rewards = mongoose.model("rewards");
const Sheets =require('./google_sheet')


router.get("/rewards/:employeeId", ensureAuth, async (req, res) => {
  try {
    const levelList = await Level.find({ employeeID: req.params.employeeId });
    levelList.sort((a, b) => {
      return a.badges - b.badges;
    });
  const employee=await Admin.findById(req.params.employeeId);
    let levels = [];
    let flag = 0;
    let progresslevels;
    let showprogress = false;
    for (let i = 0; i < levelList.length; i++) {
      if (levelList[i].badges <= employee.badges) {
        levels.push({ ...levelList[i]._doc, state: 2 });
        if (i == 0) {
          progresslevels = {
            level1: levelList[i],
            level2: levelList[i + 1],
            levelno: i,
          };
        } else {
          progresslevels = {
            level1: levelList[i - 1],
            level2: levelList[i],
            levelno: i - 1,
          };
        }
      } else if (levelList[i].badges > employee.badges && flag === 0) {
        flag = 1;
  
        levels.push({ ...levelList[i]._doc, state: 1 });
        progresslevels = {
          level1: levelList[i - 1],
          level2: levelList[i],
          levelno: i - 1,
        };
      } else {
        levels.push({ ...levelList[i]._doc, state: 0 });
      }
      levelList[i].save();
    }
   
   
    res.locals.showprogress = showprogress;
   
    res.locals.levels = levels;
    res.locals.progresslevels = progresslevels;
  
    let url =
      "https://docs.google.com/spreadsheets/d/1Zd9z4_v9etwEfdm4Jbd-kV6LbuVSscoBtonjF8KRqlY/edit#gid=0";
    const options = {
      url,
      responseType: "arraybuffer",
    }; 
    const sheets = new Sheets()
      const auth = await sheets.googleAuth()
     const allrewardshistory=  await sheets.readRow({
        spreadsheetId:'1Zd9z4_v9etwEfdm4Jbd-kV6LbuVSscoBtonjF8KRqlY',
        auth:auth,
        sheetName:'Sheet2',
     })
  
     const rewardsdata=  await sheets.readRow({
        spreadsheetId:'1Zd9z4_v9etwEfdm4Jbd-kV6LbuVSscoBtonjF8KRqlY',
        auth:auth,
        sheetName:'Sheet1',
     })
   
    const rewardshistory=allrewardshistory.filter(
        (reward) => reward[0] === employee._id.toString()
      );
    res.locals.managerVisiting = req.query.manager === "True";
    console.log(req.params);
    res.locals.rewardsdata = rewardsdata;
    res.locals.employee = employee;
    res.locals.user = employee;
    res.locals.rewardsHistory=rewardshistory;
    res.render("rewards");
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
  });
  
router.get('/exceldata',async(req,res)=>{
   
try{
  let id=req.query.id;
  const sheets = new Sheets()
  const auth = await sheets.googleAuth()


 let rewardsdata=  await sheets.readRow({
    spreadsheetId:id,
    auth:auth,
    sheetName:'Application Form',
 })
rewardsdata.forEach((reward)=>{
  reward.splice(3, 0, '');
}
)
console.log(rewardsdata[0])
res.status(200).send(rewardsdata)
}
catch(error)
{
console.log(error);
res.status(500).send({message:"server error"});
}


  })
  router.post("/rewards/purchase", async (req, res) => {
    try {
      let { employeeId, product } = req.body; // Destructure the req.body to get "employee" and "product" directly.
      const rewards = {
        employeeId: employeeId,
        title: product[0],
        badges: product[2],
        link: product[4],
        image: product[3],
        status:"Your Request is under Process"
      }
      let employee=await Admin.findById(employeeId)
      if(employee.badges-employee.usedBadges>=product[2])
      employee.usedBadges +=product[2] ;
      else
      return res.status(500).send({message:"can't purchase "});
      
      await employee.save();
  
      const message = {
        unfurl_media: false,
        unfurl_links: true,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `${employee.displayName} wants to buy <${product[4]}|${product[0]}> for ${product[2]} badges`,
            },
            accessory: {
              type: "image",
              image_url: product[3],
              alt_text: "cute cat",
            },
          },
        ],
      };
  
     
      const slackResult = await axios.post(
        "https://hooks.slack.com/services/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",
        message
      );
    const valuesToAppend = [
        [
          rewards.employeeId,
          employee.displayName,
          rewards.title,
          product[1],
          rewards.badges,
          rewards.image,
          rewards.link,
          rewards.status,
        ]
      ];

      const sheets = new Sheets()
      const auth = await sheets.googleAuth()
      const response = await sheets.writeRow({
          spreadsheetId:'1Zd9z4_v9etwEfdm4Jbd-kV6LbuVSscoBtonjF8KRqlY',
          auth:auth,
          sheetName:'Sheet2',
          values:valuesToAppend
      })
    
  
      res.status(200).json({ message: "Purchase successful!" }); // Send a response indicating success.
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
  });

// async function dl()
// {
//     let employee=await Admin.findById('6476f585a45df7fb73a44035')
   
//     employee.usedBadges =0 ;
    
    
//     await employee.save();
// }
//  dl()

module.exports = router;
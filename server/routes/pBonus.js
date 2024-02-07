const { Router } = require("express");
const { ensureAuth, ensureManager } = require("../middleware/auth");
const mongoose = require("mongoose");
const axios = require("axios");

const router = new Router();

const Admin = mongoose.model("admins");
const ESOPConfig = mongoose.model("esopConfigs");
const ESOPInfo = mongoose.model("esopInfos");

const BonusInfo = mongoose.model("bonusInfos");
const moment = require("moment");

function commafy( num ) {
  if(!num) return 0;
  var x = num.toString();
  var afterPoint = '';
  if (x.indexOf('.') > 0)
      afterPoint = x.substring(x.indexOf('.'), x.length);
  x = Math.floor(x);
  x = x.toString();
  var lastThree = x.substring(x.length - 3);
  var otherNumbers = x.substring(0, x.length - 3);
  if (otherNumbers != '')
      lastThree = ',' + lastThree;
  var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
  return res;
}

async function x()
{
  let employeeId='64e72baf9f92934f548f1cd9'
  await BonusInfo.deleteMany({employeeId});
}
//x();
router.get("/bonus", ensureAuth, async (req, res) => {
  try {
    
    let user = req.user;
    let employeeId = user._id;
    let esopConfig = await ESOPConfig.findOne({});

    if (esopConfig) {
      const esopLastUpdatedDate = moment(esopConfig.updatedOn).format(
        "Do MMM YYYY"
      );
      res.locals.esopLastUpdatedDate = esopLastUpdatedDate;
    }

    let esopInfo = await ESOPInfo.findOne({ employeeId });
    let bonusInfo = await BonusInfo.findOne({ employeeId });
   

    const today = moment();

    let bonusAvailable = 0;

    for (let i = 0; i < bonusInfo?.monthlyDistribution?.length; i++) {
        if (new Date() > new Date(bonusInfo?.monthlyDistribution[i].date) && bonusInfo?.monthlyDistribution[i].status === 'Locked') {
            bonusInfo.monthlyDistribution[i].status = 'Available'; // Update the status
        }
    
        if (bonusInfo?.monthlyDistribution[i].status === 'Available') {
            bonusAvailable += parseFloat(bonusInfo.monthlyDistribution[i].amount);
        }
    }
    
 
      // Assuming bonusInfo is an object with a valid vestingStartDate property
let bonusPercentageTime = bonusInfo ? ((new Date().getTime() - new Date(bonusInfo.vestingStartDate).getTime()) / (365 * 24 * 60 * 60 * 10)).toFixed(2) : 0;

if(bonusInfo)
{   bonusInfo.markModified('monthlyDistribution')
   await bonusInfo.save()
  }
    res.locals.bonusPercentageTime = Math.min(100, parseFloat(bonusPercentageTime));
    res.locals.esopInfo = esopInfo;
    res.locals.esopConfig = esopConfig;
    res.locals.bonusInfo = bonusInfo;
   
    res.locals.currBonusValue = commafy(bonusAvailable);
    const esopRows = [];
    const esopVestingPeriod = esopInfo?.vestingPeriod;
    const vestingYearCnt = esopVestingPeriod;
    const units = esopInfo?.units / vestingYearCnt;
    const esopAllotedDate = moment(esopInfo?.allotedOn);
    let  esopsPercentageTime = Math.round(
      ((today.unix()*1000  - esopInfo?.allotedOn) /
        (vestingYearCnt * 12 * 30 * 24 * 60 * 60 * 1000)) * 100
    );
    esopsPercentageTime = Math.min(esopsPercentageTime, 100);
  
    res.locals.esopsPercentageTime = esopsPercentageTime == 0 ? 1 : esopsPercentageTime;
    let currUnits = 0;
    for (let i = 0; i < vestingYearCnt; i++) {
      let esopTimeDiff = 0;
      const vestingDate = esopAllotedDate.clone().add((i + 1) * 1, "years");
      let timePeriod = `${(i + 1)} Year`;


      let status = false;
      if (vestingDate.isBefore(today)){
        status = true;
      }
      currUnits += units;

      esopRows.push({
        timePeriod,
        units: currUnits.toFixed(0),
        status,
      });
    }

    let mul = 0;
    for (let i = 0; i < esopRows.length; i++) {
      if (esopRows[i].status) {
        mul++;
      } else break;
    }

    let unitsAlloted = mul * esopRows[0]?.units;
    let currValue = unitsAlloted * esopConfig?.unitValue;
    let currTotalValue = esopInfo?.units * esopConfig?.unitValue;
    res.locals.esopRows = esopRows;
    res.locals.unitsAlloted = unitsAlloted;
    res.locals.currValue = commafy(currValue.toFixed(0));
    res.locals.currTotalValue = commafy(currTotalValue.toFixed(0));
    res.locals.unitValue = commafy(esopConfig?.unitValue?.toFixed(0));
    res.locals.totalBonusAmount = commafy(bonusInfo?.amount?.toFixed(0));
    res.locals.firstName = user.firstName;
    res.locals.employeeId = employeeId;
    res.render("p-bonus");
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});

router.post("/bonus/withdraw", ensureAuth, async (req, res) => {
  try {
    let employeeId = req.user._id;
    let user = await Admin.findById(employeeId);
    let bonusInfo = await BonusInfo.findOne({ employeeId });
    let amountWithdraw=0;
    for(let i=0;i< bonusInfo?.monthlyDistribution?.length;i++)
    { let bonus=bonusInfo?.monthlyDistribution[i]
      if(bonus.status=='Available')
{      bonus.status='Withdrawn'
    amountWithdraw+=parseFloat(bonus.amount)
}
bonusInfo.monthlyDistribution[i]=bonus
    }
    bonusInfo.markModified('monthlyDistribution')
    console.log(bonusInfo)
   await bonusInfo.save()
    const message = {
      unfurl_media: false,
      unfurl_links: true,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${user.displayName} wants to withdraw ₹${amountWithdraw} as bonus`
          },
        },
      ],
    };
  
    await axios.post(
      "https://hooks.slack.com/services/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",
      message
    );
    res.status(200).send({
      status: "success",
    });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        error: "Something went wrong",
        status: "failure",
      });
    }
  }
);


router.get("/admin/bonus", ensureAuth, ensureManager, async (req, res) => {
  try {
    
    let employeeId = req.query.employeeId;
    if (!employeeId) throw Error("No Employee ID Provided");
    let user = await Admin.findById(employeeId);
    let esopConfig = await ESOPConfig.findOne({});

    if (esopConfig) {
      const esopLastUpdatedDate = moment(esopConfig.updatedOn).format(
        "Do MMM YYYY"
      );
      res.locals.esopLastUpdatedDate = esopLastUpdatedDate;
    }

    let esopInfo = await ESOPInfo.findOne({ employeeId });
    let bonusInfo = await BonusInfo.findOne({ employeeId });
   

    const today = moment();

    let bonusAvailable = 0;

    for (let i = 0; i < bonusInfo?.monthlyDistribution?.length; i++) {
        if (new Date() > new Date(bonusInfo?.monthlyDistribution[i].date) && bonusInfo?.monthlyDistribution[i].status === 'Locked') {
            bonusInfo.monthlyDistribution[i].status = 'Available'; // Update the status
        }
    
        if (bonusInfo?.monthlyDistribution[i].status === 'Available') {
            bonusAvailable += parseFloat(bonusInfo.monthlyDistribution[i].amount);
        }
    }
    
 
      // Assuming bonusInfo is an object with a valid vestingStartDate property
let bonusPercentageTime = bonusInfo ? ((new Date().getTime() - new Date(bonusInfo.vestingStartDate).getTime()) / (365 * 24 * 60 * 60 * 10)).toFixed(2) : 0;


    const esopRows = [];
    const esopVestingPeriod = esopInfo?.vestingPeriod;
    const vestingYearCnt = esopVestingPeriod;
    const units = esopInfo?.units / vestingYearCnt;
    const esopAllotedDate = moment(esopInfo?.allotedOn);
    let esopsPercentageTime = Math.round(
      ((today.unix()*1000  - esopInfo?.allotedOn) /
        (vestingYearCnt * 12 * 30 * 24 * 60 * 60 * 1000)) * 100
    );
    esopsPercentageTime = Math.min(esopsPercentageTime, 100);
    console.log((today.unix()*1000  - esopInfo?.allotedOn));
    
    let currUnits = 0;
    for (let i = 0; i < vestingYearCnt; i++) {
      const vestingDate = esopAllotedDate.clone().add((i + 1) * 1, "years");
      let timePeriod = `${(i + 1)} Year`;


      let status = false;
      if (vestingDate.isBefore(today)){
        status = true;
      }
      currUnits += units;

      esopRows.push({
        timePeriod,
        units: currUnits?.toFixed(0),
        status,
      });
    }

    let mul = 0;
    for (let i = 0; i < esopRows.length; i++) {
      if (esopRows[i].status) {
        mul++;
      } else break;
    }
    if(bonusInfo)
 {   bonusInfo.markModified('monthlyDistribution')
    await bonusInfo.save()}
    res.locals.esopsPercentageTime = esopsPercentageTime == 0 ? 1 : esopsPercentageTime;
    res.locals.bonusPercentageTime = Math.min(100, parseFloat(bonusPercentageTime));
    res.locals.esopInfo = esopInfo;
    res.locals.esopConfig = esopConfig;
    res.locals.bonusInfo = bonusInfo;
      res.locals.currBonusValue = commafy(bonusAvailable);
    let unitsAlloted = mul * esopRows[0]?.units;
    let currValue = unitsAlloted * esopConfig?.unitValue;
    let currTotalValue = esopInfo?.units * esopConfig?.unitValue;
    res.locals.esopRows = esopRows;
    res.locals.unitsAlloted = unitsAlloted;
    res.locals.currValue = commafy(currValue?.toFixed(0));
    res.locals.currTotalValue = commafy(currTotalValue?.toFixed(0));
    res.locals.unitValue = commafy(esopConfig?.unitValue?.toFixed(0));
    res.locals.totalBonusAmount = commafy(bonusInfo?.amount?.toFixed(0));
    res.locals.firstName = user.firstName;
    res.locals.employeeId = employeeId;

    res.render("p-bonus-admin");
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});
router.get('/bonus/:id',ensureAuth,ensureManager,async(req,res)=>{
try{
  let id=req.params.id;
  let bonusInfo=await BonusInfo.findOne({employeeId:id});
  res.status(200).send({bonusInfo});

} catch (error) {
  console.log(error);
  res.status(500).send({
    error: "Something went wrong",
  });
}
});


router.patch("/admin/bonus/esop/allot", ensureAuth, ensureManager, async (req, res) => {
  
  try {
    let units = req.body.units;
  let employeeId = req.body.employeeId;
  let vestingPeriod = req.body?.vestingPeriod || 4;
  let unitValue = req.body?.unitValue;
  if (!employeeId) throw new Error("No Employee ID Provided");
      let esopConfig = await ESOPConfig.findOne({});
      if (esopConfig) {
        if (unitValue){
          esopConfig.unitValue = unitValue;
          esopConfig.updatedOn = Date.now();
          esopConfig.save();
        }
      } else {
        esopConfig = await ESOPConfig.create({
          unitValue: unitValue,
        });
      }
      let esopInfo = await ESOPInfo.findOne({ employeeId });

      if (esopInfo) {
        esopInfo.units = units;
        esopInfo.vestingPeriod = vestingPeriod;
        await esopInfo.save();
      } else {
        esopInfo = await ESOPInfo.create({
          employeeId: employeeId,
          units: units,
          allotedOn: Date.now(),
          vestingPeriod: vestingPeriod,
        });
      } 
    console.log(esopInfo);
    res.status(200).send({
      id: esopInfo._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});

router.post("/admin/bonus/allot", ensureAuth, ensureManager, async (req, res) => {
  try {
    console.log(req.body)
    let employeeId = req.body.employeeId;
  if (!employeeId) throw new Error("No Employee ID Provided");
    let bonusInfo = await BonusInfo.findOne({ employeeId });

    if (bonusInfo) {
      await BonusInfo.findOneAndUpdate({ employeeId },req.body);
    } else {
      bonusInfo = await BonusInfo.create(req.body);
    }
   
    res.status(200).send({
      id: bonusInfo._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Something went wrong",
    });
  }
});

module.exports = router;

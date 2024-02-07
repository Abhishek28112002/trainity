const mongoose=require('mongoose');
const PerformanceRecord = mongoose.model("performanceRecords");
const moment = require("moment"); 

module.exports = {
  ensureAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      res.locals.user = req.user;
      return next();
    } else {
      res.redirect("/");
    }
  },
  ensureManager: function (req, res, next) {
    if (req.isAuthenticated() && req.user.position === 0) {
      return next();
    } else {
      res.redirect("/not-found");
    }
  },
  ensureGuest: async function (req, res, next) {
    if (req.isAuthenticated()) {
      const today = moment();
      const date = today.format("YYYY-MM-DD");
      let employee=req.user;
      if(employee.position==0){
       res.redirect(`/performanceBoard/?date=${date}`);
     }
     else{
       res.redirect(`/performanceBoardemployee/${date}`);
     }
    } else {
      return next();
    }
  },
};

//Auth Routes
const moment = require("moment"); 
const express = require("express");
const router = express.Router();
const passport = require("passport");

//@desc Auth with Google
//@route GET /auth/google

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

//@desc Google Auth Callback
//@route GET /auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const today = moment();
    const date = today.format("YYYY-MM-DD");
   let employee=req.user;
   if(employee.position==0){
    res.redirect(`/performanceBoard/?date=${date}`);
  }
  else{
    res.redirect(`/performanceBoardemployee/${date}`);
  }
}
);

//@desc Logout User
//@route GET /auth/logout

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;

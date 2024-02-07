const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");

const Admin = mongoose.model("admins");
const AuthorizedAdmin = mongoose.model("authorizedAdmins");

//Passport Strategy Configuration
module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        proxy: true,
        clientID:
          "607288417198-seoj3alc45p00msieqlagj6kttgdnnje.apps.googleusercontent.com",
        clientSecret: "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",
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        const newUser = {
          googleID: profile.id,
          displayName: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          image: profile.photos[0].value,
        };

        try {
          const allowedAdmin = await AuthorizedAdmin.findOne({
            email: newUser.email,
          });

          if (!allowedAdmin) {
            return done(null, null);
          }

          let user = await Admin.findOne({ email: newUser.email });

          if (!user) {
            user = await Admin.create({
              ...newUser,
              phone: allowedAdmin.phone,
              position: allowedAdmin.position,
              team:allowedAdmin.team
            });
          }
          done(null, user);
        } catch (err) {
          console.log(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await Admin.findById(id);
      if (user) return done(null, user);
      done(null, null);
    } catch (error) {
      done(error, null);
    }
    // Admin.findById(id, (err, user) => done(err, user));
  });
};

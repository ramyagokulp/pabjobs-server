const passport = require("passport");

const optionalAuth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, function (err, user, info) {
    console.log(user,info)
    if (err) {
        // console.log('Err ',err)
    //   return next(err);
    }
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = optionalAuth;

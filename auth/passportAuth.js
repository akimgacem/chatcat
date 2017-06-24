module.exports = function(passport, FacebookStrategy, config, mongoose) {

  var chatUser = new mongoose.Schema({
    profileID: String,
    fullname: String,
    profilePic: String
  });

  var User = mongoose.model('chatUser', chatUser);

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, doc) => {
      done(err, doc);
    })
  });

  passport.use(new FacebookStrategy({
    clientID: config.fb.appID,
    clientSecret: config.fb.appSecret,
    callbackURL: config.fb.callbackURL,
    profileFields: ['id', 'displayName', 'photos']
  },
  (accessToken, refreshToken, profile, done) => {

    console.log(JSON.stringify(profile));

    User.findOne({profileID: profile.id}, (err, doc) => {
      if (err) {
        console.log("error in database access");
        done(err);
      } else if (doc) {
        done(null, doc);
      } else {
        var newUser = new User({
          profileID: profile.id,
          fullname: profile.displayName,
          profilePic: profile.photos[0].value || ''
        })
        newUser.save((err) => {
          if (err) {
            done(err);
          } else {
            done(null, newUser);
          }
        });
      }
    });

  }));
}

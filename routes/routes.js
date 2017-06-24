'use strict';

module.exports = function(express, app, passport, config, rooms) {
  var router = express.Router();

  router.get('/', (req, res, next) => {
    res.render('index', {title: "Welcome to ChatCat"});
  });

  function securePages(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect('/');
    }
  }

  function findTitle(roomNumber) {
    for (let r of rooms) {
      if (roomNumber == r.roomNumber) {
        return r.roomName;
      }
    }
    return "";
  }

  router.get('/auth/facebook', passport.authenticate('facebook'));

  router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/chatrooms',
    failureRedirect: '/'
  }));

  router.get('/chatrooms', securePages, (req, res, next) => {
    //console.log(JSON.stringify(req.user));
    res.render('chatrooms', {title: "Chatrooms", user: req.user, config: config});
  });

  router.get('/room/:id', securePages, (req, res, next) => {
    // console.log("Title" + findTitle(req.params.id));
    res.render('room', {user: req.user, roomNumber: req.params.id, roomName: findTitle(req.params.id)});
  });

  router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
  })

  app.use('/', router);

};

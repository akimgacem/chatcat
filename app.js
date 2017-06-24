'use strict';

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var config = require('./config/appconfig');
var ConnectMongo = require('connect-mongo')(session);
var mongoose = require("mongoose").connect(config.dbURL);
var passport = require('passport');

var rooms = [];

var FacebookStrategy = require('passport-facebook').Strategy;

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
if (app.get('env') === 'development') {
  app.use(session({
    secret: config.sessionSecret,
    saveUninitialized: true,
    resave: true}));
} else {
  app.use(session({
    secret: config.sessionSecret,
    saveUninitialized: true,
    resave: true,
    store: new ConnectMongo({
      url: config.dbURL,
      stringify: true}),
  }));
}

require('./auth/passportAuth.js')(passport, FacebookStrategy, config, mongoose);

app.use(passport.initialize());
app.use(passport.session());

require('./routes/routes.js')(express, app, passport, config, rooms);

// app.listen(config.port, () => {
//   console.log('Chat app started on port ' + config.port);
// });

app.set('port', config.port);

var server = require('http').createServer(app);

var io = require('socket.io').listen(server);

require('./socket/socket.js')(io, rooms);

server.listen(app.get('port'), () => {
  console.log('Chat app started on port ' + config.port);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

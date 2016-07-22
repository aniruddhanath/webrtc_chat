'use strict';

// set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require("express"),
  config = require('config');

// server setup
var app = express(),
  redis = require('redis').createClient(),
  server = require('http').createServer(app);

redis.on("error", function (err) {
  console.log("Error " + err);
});

// cors headers
app.all('/*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

// routes
require('./routes')(app);

// socket.io
var io = require("socket.io").listen(app.listen(config.socket_port));
require('./socket')(io);

// start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// expose app
exports = module.exports = app;

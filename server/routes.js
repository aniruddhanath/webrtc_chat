'use strict';

var config = require('config'),
  redis = require('redis').createClient();

module.exports = function(app) {

  app.get("/", function (req, res) {
    res.send("It works!");
  });

  app.get("/users", function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    redis.hgetall(config.keys.users, function (err, hash) {
      if (err || !hash) {
        res.send([]);
        return;
      }
      const users = Object.keys(hash).map(function (key) {
        return hash[key];
      });
      res.send(users);
    });
  });

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.status(404).send({ message: 'Not Found' });
    });
};

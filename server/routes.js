'use strict';

var config = require('config'),
  redis = require('redis').createClient();

module.exports = function(app) {

  app.get("/", function (req, res) {
    res.send("It works!");
  });

  app.get("/users", function (req, res) {
    redis.keys(config.keys.users + "*", function (err, keys) {
      if (err || !keys || !keys.length) {
        res.send([]);
        return;
      }

      var users = [];
      // async parallel pattern
      keys.forEach(function (key) {
        redis.hgetall(key, function (err, user) {
          if (!err && user) {
            users.push(user);
            if (users.length === keys.length) {
              res.send(users);
            }
          }
        });
      });
    });
  });

  app.route('/*')
    .get(function(req, res) {
      res.status(404).send({ message: 'Not Found' });
    });
};

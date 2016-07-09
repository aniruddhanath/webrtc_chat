'use strict';

var config = require('config'),
  uuid = require('node-uuid'),
  redis = require('redis').createClient();

module.exports = function(io) {

  io.sockets.on("connection", function (socket) {

    socket.once("disconnect", function () {
      socket.disconnect();
      redis.hgetall(config.keys.users + socket.id, function (err, user) {
        if (!err && user) {
          // send to others
          socket.broadcast.emit("user:left", user);
          redis.del(config.keys.users + socket.id);
          console.log("disconnect", user);
        }
      });
    });

    // user joins
    socket.on("userJoined", function (payload) {
      // todo check for duplicate entries

      var nUser = {
        id: uuid.v1(),
        sid: socket.id,
        name: payload.name,
        time: Date.now(),
        busy: false
      };
      Object.keys(nUser).forEach(function (key) {
        redis.hset(config.keys.users + nUser.sid, key, nUser[key]);
      });
      // send only to client
      socket.emit("user:loggedin", nUser);
      // send to others
      socket.broadcast.emit("user:joined", nUser);
      console.log("userJoined", payload);
    });

    socket.on("startCall", function (payload) {
      // join the room
      socket.join(payload.room);
      console.log("created room", payload.room);
      
      // mark busy
      redis.hgetall(config.keys.users + socket.id, function (err, user) {
        user.busy = true;
        Object.keys(user).forEach(function (key) {
          redis.hset(config.keys.users + user.sid, key, user[key]);
        });
        socket.broadcast.emit("user:busy", user);
      });
      
      // ask the callee to join the room
      console.log("call started by", payload.caller);
      io.sockets.connected[payload.callee.sid].emit('call:incoming', payload.room, payload.caller);
    });

    socket.on("receiveCall", function (payload) {
      // join the room
      socket.join(payload.room);
      console.log("joinedRoom", payload.room);

      // mark busy
      redis.hgetall(config.keys.users + socket.id, function (err, user) {
        user.busy = true;
        Object.keys(user).forEach(function (key) {
          redis.hset(config.keys.users + user.sid, key, user[key]);
        });
        io.sockets.emit("user:busy", user);
        io.to(payload.room).emit('call:ready', payload.room, payload.caller, user);
      });
    });

    socket.on("disconnectCall", function (payload) {
      var socks = Object.keys(io.sockets.adapter.rooms[payload.room].sockets);

      // mark unbusy
      socks.forEach(function (sock) {
        redis.hgetall(config.keys.users + sock, function (err, user) {
          if (!err && user) {
            user.busy = false;
            Object.keys(user).forEach(function (key) {
              redis.hset(config.keys.users + user.sid, key, user[key]);
            });
            io.sockets.emit("user:busy", user);
          }
        });
      });
      io.to(payload.room).emit('call:disconnect');
    });

    socket.on("signalingMessage", function (payload) {
      io.to(payload.room).emit("call:signaling", payload.message);
    });

    socket.on("broadcast", function (message) {
      socket.broadcast.emit('message', message);
      console.log("broadcasting", socket.id, message);
    });

  });

};
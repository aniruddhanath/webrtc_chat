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
          console.log("user left", user);
        }
      });
    });

    // user joins
    socket.on("userJoined", function (payload) {
      // TODO: check for duplicate entries
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
      console.log("user joined", payload);
    });

    socket.on("startCall", function (payload) {
      // join the room
      socket.join(payload.room);
      console.log("room created", payload.room);
      
      // mark caller busy
      redis.hgetall(config.keys.users + socket.id, function (err, user) {
        user.busy = true;
        Object.keys(user).forEach(function (key) {
          redis.hset(config.keys.users + user.sid, key, user[key]);
        });
        io.sockets.emit("user:busy", user);
      });

      // mark callee busy
      redis.hgetall(config.keys.users + payload.callee.sid, function (err, user) {
        user.busy = true;
        Object.keys(user).forEach(function (key) {
          redis.hset(config.keys.users + user.sid, key, user[key]);
        });
        io.sockets.emit("user:busy", user);
      });

      // ask the callee to join the room
      io.sockets.connected[payload.callee.sid].emit('call:incoming', payload.room, payload.caller);
      console.log("call on room", payload.room, "started by", payload.caller, "to", payload.callee);
    });

    socket.on("receiveCall", function (payload) {
      // join the room
      socket.join(payload.room);
      console.log("room joined", payload.room);

      io.to(payload.room).emit('call:ready', payload.room, payload.caller, payload.callee);
      console.log("call on room", payload.room, "from", payload.caller, "received by", payload.callee);
    });

    socket.on("rejectCall", function (payload) {
      var socks = [payload.caller.sid, payload.callee.sid];

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
      socket.emit('call:rejected');
      io.to(payload.room).emit('call:rejected');
      console.log("call on room", payload.room, "from", payload.caller, "rejected by", payload.callee);
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
      console.log("call diconnected on room", payload.room);
    });

    socket.on("signalingMessage", function (payload) {
      io.to(payload.room).emit("call:signaling", payload.message);
      console.log("signaling to", payload.room, "message", payload.message);
    });

    socket.on("broadcast", function (message) {
      socket.broadcast.emit('message', message);
      console.log("broadcasting from", socket.id, "message", message);
    });
  });
};
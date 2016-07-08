'use strict';

var config = require('config'),
  uuid = require('node-uuid'),
  redis = require('redis').createClient();

// remove
var usersObject = {},
  connections = 0;

module.exports = function(io) {

  io.sockets.on("connection", function (socket) {

    socket.once("disconnect", function () {
      socket.disconnect();
      redis.hget(config.keys.users, socket.id, function (err, user) {
        if (user) {
          // send to others
          socket.broadcast.emit("user:left", usersObject[socket.id]);
          redis.hdel(config.keys.users, socket.id);
          console.log("disconnect", user);
        }
      });
    });

    // user joins
    socket.on("userJoined", function (payload) {
      var nUser = {
        id: uuid.v1(),
        sid: socket.id,
        name: payload.name,
        time: Date.now(),
        free: true
      };
      redis.hset(config.keys.users, socket.id, JSON.stringify(nUser));
      // send only to client
      socket.emit("user:loggedin", nUser);
      // send to others
      socket.broadcast.emit("user:joined", nUser);
      console.log("userJoined", payload);
    });

    socket.on("startCall", function (payload) {
      var num_clients = io.sockets.adapter.rooms[payload.room] && io.sockets.adapter.rooms[payload.room].length;
      if (num_clients) {
        socket.emit("error", "Room already created");
      } else {
        // join the room
        socket.join(payload.room);
        // mark busy
        socket.broadcast.emit("user:busy", usersObject[socket.id]);
        // ask the callee to join the room
        console.log("call started by", payload.socket_id);
        io.sockets.connected[payload.socket_id].emit('call:incoming', payload.room, usersObject[socket.id]);
        console.log("createdRoom", payload.room);
      }
    });

    socket.on("disconnectCall", function (payload) {
      console.log(io.sockets.adapter.rooms[payload.room].sockets);
      console.log("===================");
      io.to(payload.room).emit('call:disconnect');
    });

    socket.on("receiveCall", function (payload) {
      var num_clients = io.sockets.adapter.rooms[payload.room].length;
      if (num_clients > 2) {
        socket.emit("error", "User is busy");
      } else {
        socket.join(payload.room);
        // socket.emit('joinedRoom', payload.room, socket.id);
        io.to(payload.room).emit('call:ready', payload.room, payload.caller, usersObject[socket.id]);
        // mark busy
        socket.broadcast.emit("user:busy", usersObject[socket.id]);
        console.log("joinedRoom", payload.room);
      }
    });

    socket.on("signalingMessage", function (payload) {
      io.to(payload.room).emit("call:signaling", payload.message);
    });

    socket.on("broadcast", function (message) {
      socket.broadcast.emit('message', message);
      console.log("broadcasting", socket.id, message);
    });

    connections++; // increment connections
    console.log("Connected: %s sockets connected", connections);
  });

};
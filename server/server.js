var os = require('os'),
  express = require("express"),
  app = express(),
  port = 9000;

var usersObject = {},
  connections = 0;

// routes
app.get("/", function (req, res) {
  res.send("It works!");
});

app.get("/users", function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  var users = Object.keys(usersObject).map(function (key) {
    return usersObject[key];
  });
  res.send(users);
});

app.get("/ipaddr", function (req, res) {
  var ipaddr,
    ifaces = os.networkInterfaces();
  for (var dev in ifaces) {
    ifaces[dev].forEach(function (details) {
      if (details.family=='IPv4' && details.address != '127.0.0.1') {
        ipaddr = details.address;
      }
    });
  }
  res.send({ ipaddr: ipaddr });
});

// socket.io
var io = require("socket.io").listen(app.listen(port));

io.sockets.on("connection", function (socket) {
  
  socket.once("disconnect", function () {
    connections--; // decrement #connections
    socket.disconnect();
    console.log("Disconnected: %s sockets connected", connections);

    if (usersObject[socket.id]) {
      socket.broadcast.emit("user:left", usersObject[socket.id]); // send to others
      delete usersObject[socket.id]; // remove user
    }
  });

  // user joins
  socket.on("userJoined", function (payload) {
    var newUser = {
      sid: socket.id,
      name: payload.name,
      user: payload.user
    };
    usersObject[socket.id] = newUser;

    socket.emit("user:loggedin", newUser); // send to client

    socket.broadcast.emit("user:joined", newUser); // send to others
    console.log("userJoined", payload);
  });

  socket.on("startCall", function (payload) {
    var num_clients = io.sockets.adapter.rooms[payload.room] && io.sockets.adapter.rooms[payload.room].length;
    if (num_clients) {
      socket.emit("error", "Room already created");
    } else {
      // join the room
      socket.join(payload.room);
      // ask the callee to join the room
      console.log("call started by", payload.socket_id);
      io.sockets.connected[payload.socket_id].emit('call:incoming', payload.room, usersObject[socket.id]);
      console.log("createdRoom", payload.room);
    }
  });

  socket.on("receiveCall", function (payload) {
    var num_clients = io.sockets.adapter.rooms[payload.room].length;
    if (num_clients > 2) {
      socket.emit("error", "User is busy");
    } else {
      socket.join(payload.room);
      // socket.emit('joinedRoom', payload.room, socket.id);
      io.to(payload.room).emit('call:ready', payload.room, payload.caller, usersObject[socket.id]);
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

console.log("Listening on port " + port);

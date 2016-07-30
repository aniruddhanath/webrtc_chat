import dispatcher from "../dispatcher";
import io from "socket.io-client";

var socket = io("http://localhost:4000");

socket.on("connect", onConnection);
socket.on("user:loggedin", onLoggedIn);
socket.on("user:joined", onUserJoined);
socket.on("user:left", onUserLeft);
socket.on("user:busy", onUserBusy);

socket.on("call:incoming", onCall);
socket.on("call:ready", onReady);
socket.on("call:signaling", onSignaling);
socket.on("call:disconnect", onDisconnect);
socket.on("call:rejected", onReject);

socket.on("message", onMessage);
socket.on("error", onError);

// connection
function onConnection() {
  const payload = {
    _id: "Connection",
    sock_id: socket.id
  };
  console.log("socket.id: ", socket.id);
  dispatcher.dispatch(payload);
}

// user activities
function onLoggedIn(user) {
  const payload = {
    _id: "User:Loggedin",
    user: user
  };
  dispatcher.dispatch(payload);
}

function onUserJoined(user) {
  const payload = {
    _id: "User:Joined",
    user: user
  };
  dispatcher.dispatch(payload);
}

function onUserLeft(user) {
  const payload = {
    _id: "User:Left",
    user: user
  };
  dispatcher.dispatch(payload);
}

function onUserBusy(user) {
  const payload = {
    _id: "User:Busy",
    user: user
  };
  dispatcher.dispatch(payload);
}

// call related
function onCall(room, caller) {
  const payload = {
    _id: "Call:Incoming",
    room,
    caller
  };
  dispatcher.dispatch(payload);
}

function onReady(room, caller, receiver) {
  const payload = {
    _id: "Call:Ready",
    room,
    caller,
    receiver
  };
  dispatcher.dispatch(payload);
}

function onSignaling(message) {
  const payload = {
    _id: "Call:Signaled",
    message
  };
  dispatcher.dispatch(payload);
}

function onDisconnect() {
  const payload = {
    _id: "Call:Disconnect"
  };
  dispatcher.dispatch(payload);
}

function onReject() {
  const payload = {
    _id: "Call:Reject"
  };
  dispatcher.dispatch(payload);
}

// general
function onMessage(message) {
  const payload = {
    _id: "Message",
    message: message
  };
  dispatcher.dispatch(payload);
}

function onError(message) {
  const payload = {
    _id: "Error",
    message: message
  };
  dispatcher.dispatch(payload);
}

export function send(eventName, payload) {
  socket.emit(eventName, payload);
}

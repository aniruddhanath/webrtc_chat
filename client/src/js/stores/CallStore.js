require("webrtc-adapter");

import { EventEmitter } from "events";
import dispatcher from "../dispatcher";

class CallStore extends EventEmitter {

  constructor() {
    super();
    this.room = null;
    this.incoming = {};
    this.isInitiator = true;
  }

  incomingCall() {
    return this.incoming;
  }

  reset() {
    this.room = null;
    this.incoming = {};
    this.isInitiator = true;
  }

  handleActions(payload) {
    const self = this;
    switch(payload._id) {
      case "Call:Incoming": {
        self.incoming = {
          room: payload.room,
          caller: payload.caller
        };
        self.isInitiator = false;
        self.emit("incoming", payload.caller);
        break;
      }
      case "Call:Ready": {
        self.ready = {
          room: payload.room,
          caller: payload.caller,
          receiver: payload.receiver,
          isInitiator: self.isInitiator
        };
        self.room = payload.room;
        self.emit("ready", self.ready);
        break;
      }
      case "Call:Signaling": {
        console.log(payload);
        self.emit("signaling", payload);
        break;
      }
      case "Call:Signaled": {
        console.log(payload);
        self.emit("signaled", payload.message);
        break;
      }
      case "Call:Opened": {
        self.emit("opened", payload.message);
        break;
      }
      case "Call:Disconnect": {
        self.emit("disconnect");
        break;
      }
      case "Call:Reject": {
        self.emit("reject");
        break;
      }
    }
  }
}

const call = new CallStore;
dispatcher.register(call.handleActions.bind(call));

export default call;

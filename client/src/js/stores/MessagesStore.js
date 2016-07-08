import { EventEmitter } from "events";
import dispatcher from "../dispatcher";

class MessagesStore extends EventEmitter {
  constructor() {
    super();
    this.messages = [];
  }

  all() {
    return this.messages;
  }

  reset() {
    this.messages = [];
  }

  handleActions(payload) {
    var self = this;
    switch(payload._id) {
      case "Message:Remote": {
        payload.nature = "remote";
        self.messages.push(payload.message);
        self.emit("added");
        break;
      }
      case "Message:Local": {
        payload.nature = "local";
        self.messages.push(payload.message);
        self.emit("added");
        break;
      }
    }
  }
}

const messages = new MessagesStore;
dispatcher.register(messages.handleActions.bind(messages));

export default messages;

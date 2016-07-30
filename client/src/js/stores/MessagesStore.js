import { EventEmitter } from "events";
import dispatcher from "../dispatcher";

class MessagesStore extends EventEmitter {
  constructor() {
    super();
    this.messages = [];
    this.typing = false;
  }

  all() {
    return this.messages;
  }

  reset() {
    this.messages = [];
    this.typing = false;
  }

  peerIsTyping() {
    return this.typing;
  }

  handleActions(payload) {
    var self = this;
    switch(payload._id) {
      case "Message:Remote": {
        payload.nature = "remote";
        if (payload.message.type === "message") {
          self.messages.push(payload.message);
          self.emit("added");
        }
        if (payload.message.type === "status") {
          this.typing = payload.message.text === "started";
          self.emit("typing");
        }
        break;
      }
      case "Message:Local": {
        payload.nature = "local";
        if (payload.message.type === "message") {
          self.messages.push(payload.message);
          self.emit("added");
        }
        break;
      }
    }
  }
}

const messages = new MessagesStore;
dispatcher.register(messages.handleActions.bind(messages));

export default messages;

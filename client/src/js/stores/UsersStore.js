import $ from "jquery";

import { EventEmitter } from "events";
import dispatcher from "../dispatcher";

class UsersStore extends EventEmitter {
  constructor() {
    super();
    this.users = [];
    this.user = null;
  }

  fetch() {
    const self = this;
    $.get("http://localhost:9000/users", function (users) {
      self.users = users;
      self.emit("reloaded");
    });
  }

  all() {
    return this.users;
  }

  current() {
    return this.user;
  }

  handleActions(payload) {
    const self = this;
    switch(payload._id) {
      case "User:Joined": {
        self.users.push(payload.user);
        self.emit("reloaded");
        break;
      }
      case "User:Left": {
        const users = self.users.filter((user) => {
          return user.sid !== payload.user.sid;
        });
        self.users = users;
        self.emit("reloaded");
        break;
      }
      case "User:Busy": {
        const users = self.users.map((user) => {
          if (user.sid !== payload.user.sid) {
            return user;
          }
          return payload.user;
        });
        self.users = users;
        self.emit("reloaded");
        break;
      }
      case "User:Loggedin": {
        self.user = payload.user;
        self.emit("loggedin");
        break;
      }
    }
  }
}

const users = new UsersStore;
dispatcher.register(users.handleActions.bind(users));

export default users;

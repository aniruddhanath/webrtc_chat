import React from "react";
import * as Utils from "../../lib/Utils";

export default class UserList extends React.Component {
  constructor() {
    super();
  }

  makeCall(user, disableAction, event) {
    event.preventDefault();
    if (disableAction) {
      return;
    }
    const room = Utils.generateToken();
    const self = this;
    this.props.emit("startCall", {
      room,
      caller: self.props.user,
      callee: user
    });
    this.props.startCall(user, room);
  }

  disconnectCall(user, disableAction, event) {
    event.preventDefault();
    this.props.emit("disconnectCall", {
      room: this.props.room
    });
  }

  noop(user, disableAction, event) {
    event.preventDefault();
    // do nothing
  }

  render() {
    let users = this.props.users.map((user, i) => {
      const isActive = [this.props.caller.sid, this.props.callee.sid].includes(user.sid);

      let button = {
        text: "Call",
        css: "btn-primary",
        action: this.makeCall
      };

      let disableAction = false;

      if (isActive && this.props.connectionEstablished) {
        button = {
          text: "Disconnect",
          css: "btn-danger",
          action: this.disconnectCall
        };
      } else if (isActive) {
        button = {
          text: "Calling..",
          css: "btn-info",
          action: this.noop
        };
      } else if (user.busy && user.busy !== "false") {
        button = {
          text: "Busy",
          css: "btn-warning",
          action: this.noop
        };
      }

      if ((!isActive && this.props.connectionEstablished) || this.props.processingCall) {
        button.css += " disabled";
        disableAction = true;
      }

      return (
        <li class="list-group-item" key={i}>
          {user.name}
          <button class={"btn btn-xs pull-right " + button.css} onClick={button.action.bind(this, user, disableAction)}>{button.text}</button>
        </li>
      );
    });

    if (!users.length) {
      users = (
        <li class="list-group-item">
          No online users now!
        </li>
      );
    }

    return (
      <div class="panel panel-default">
        <div class="panel-heading">
          <h3 class="panel-title">Online Users</h3>
        </div>
        <div class="panel-body">
          <ul class="list-group">{users}</ul>
        </div>
      </div>
    );
  }
}

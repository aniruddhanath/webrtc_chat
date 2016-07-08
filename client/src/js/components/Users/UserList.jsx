import React from "react";
import * as Utils from "../../lib/Utils";

export default class UserList extends React.Component {
  constructor() {
    super();
  }

  makeCall(user, event) {
    event.preventDefault();
    const room = Utils.generateToken();
    this.props.startCall(user, room);
  }

  disconnectCall(event) {
    event.preventDefault();
    this.props.emit("disconnectCall", {
      room: this.props.room
    });
  }

  render() {
    let users = this.props.users.map((user, i) => {
      const isActive = [this.props.caller.sid, this.props.callee.sid].includes(user.sid);
      
      let button = (
        <button class="btn btn-primary btn-xs pull-right" onClick={this.makeCall.bind(this, user)}>Call</button>
      );
      if (isActive && this.props.connectionEstablished) {
        button = (
          <button class="btn btn-danger btn-xs pull-right" onClick={this.disconnectCall.bind(this)}>Disconnect</button>
        );
      } else if (isActive) {
        button = (
          <button class="btn btn-info btn-xs pull-right">Calling..</button>
        );
      } else if (user.busy) {
        button = (
          <button class="btn btn-warning btn-xs pull-right">Busy</button>
        );
      }

      return (
        <li class="list-group-item" key={i}>
          {user.name}
          {button}
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

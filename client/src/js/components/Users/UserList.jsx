import React from "react";
import * as Utils from "../../lib/Utils";

export default class UserList extends React.Component {
  constructor() {
    super();
  }

  makeCall(socket_id, event) {
    event.preventDefault();
    const payload = {
      room: Utils.generateToken(),
      socket_id
    };
    this.props.emit("startCall", payload);
  }

  render() {
    const users = this.props.users.map((user, i) => {
      return (
        <li key={i}>
          <p>{i + 1} - {user.name} - {user.sid}</p>
          <button onClick={ this.makeCall.bind(this, user.sid) }>Call</button>
        </li>
      );
    });

    return (
      <div>
        <h3>Users</h3>
        <ul>{users}</ul>
      </div>
    );
  }
}

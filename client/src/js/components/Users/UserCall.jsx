import React from "react";

export default class UserCall extends React.Component {
  constructor() {
    super();
  }

  reply(event) {
    event.preventDefault();
    const payload = this.props.call;
    this.props.emit("receiveCall", payload);
  }

  render() {
    if (this.props.call.room) {
      return (
        <div>
          getting a call from {this.props.call.caller.name}
          <button onClick={this.reply.bind(this)}>Receive</button>
        </div>
      )
    }

    return (
      <div></div>
    );
  }
}

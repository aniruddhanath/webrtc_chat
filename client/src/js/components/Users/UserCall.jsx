import React from "react";

export default class UserCall extends React.Component {
  constructor() {
    super();
  }

  reply(event) {
    event.preventDefault();
    const payload = {
      room: this.props.room,
      caller: this.props.caller
    };
    this.props.emit("receiveCall", payload);
  }

  render() {
    if (!this.props.caller.name || this.props.connectionEstablished) {
      return (
        <div></div>
      );
    }

    return (
      <div class="well well-sm">
        Heads up! <strong>{this.props.caller.name}</strong> is calling..
        <button class="btn btn-primary btn-xs pull-right" onClick={this.reply.bind(this)}>Receive</button>
      </div>
    );
  }
}

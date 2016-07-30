import React from "react";

export default class UserCall extends React.Component {
  constructor() {
    super();
  }

  pickup(event) {
    event.preventDefault();
    const payload = {
      room: this.props.room,
      caller: this.props.caller,
      callee: this.props.user
    };
    this.props.emit("receiveCall", payload);
  }

  reject(event) {
    event.preventDefault();
    const payload = {
      room: this.props.room,
      caller: this.props.caller,
      callee: this.props.user
    };
    this.props.emit("rejectCall", payload);
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
        <button class="btn btn-danger btn-xs pull-right" onClick={this.reject.bind(this)}>Reject</button>
        <span class="pull-right">&nbsp;</span>
        <button class="btn btn-primary btn-xs pull-right" onClick={this.pickup.bind(this)}>Receive</button>
      </div>
    );
  }
}

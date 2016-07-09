import React from "react";

export default class MessageForm extends React.Component {
  constructor() {
    super();
    this.typing = {};
  }

  submit(event) {
    event.preventDefault();
    
    this.props.send({
      timeStamp: Date.now(),
      type: "message",
      text: this.refs.text.value.trim(),
      user: this.props.user
    });

    // clear form and others
    this.refs.text.value = "";
    this.props.send({
      type: "status",
      text: "stopped"
    });
    this.typing = {};
  }

  change(event) {
    this.typing.prev = this.typing.now;
    this.typing.now = this.refs.text.value.trim();
    
    let typing = "";
    if (!this.typing.prev && this.typing.now) {
      typing = "started";
    }
    if (this.typing.prev && !this.typing.now) {
      typing = "stopped";
    }

    if (typing) {
      this.props.send({
        type: "status",
        text: typing
      });
    }
  }

  render() {
    if (!this.props.connectionEstablished) {
      return (
        <div></div>
      );
    }
    
    return (
      <div class="form-group">
        <form onSubmit={this.submit.bind(this)}>
          <input class="form-control" type="text" ref="text" placeholder="Type a message and hit enter!" onChange={this.change.bind(this)} />
        </form>
      </div>
    );
  }
}

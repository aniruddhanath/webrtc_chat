import React from "react";

export default class MessageForm extends React.Component {
  constructor() {
    super();
  }

  submit(event) {
    event.preventDefault();
    
    this.props.send({
      timeStamp: Date.now(),
      text: this.refs.text.value.trim(),
      user: this.props.user
    });

    // clear form
    this.refs.text.value = "";
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
          <input class="form-control" type="text" ref="text" placeholder="Type a message and hit enter!" />
        </form>
      </div>
    );
  }
}

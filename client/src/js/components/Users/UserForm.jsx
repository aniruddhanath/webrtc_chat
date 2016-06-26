import React from "react";

export default class UserForm extends React.Component {
  constructor() {
    super();
  }

  onSubmit(event) {
    event.preventDefault();
    var name = this.refs.name.value.trim();
    this.props.emit("userJoined", { name: name });
    this.refs.name.value = "";
  }

  render() {
    return (
      <div>
        <h3>Choose a username to continue...</h3>
        <form onSubmit={this.onSubmit.bind(this)}>
          <input type="text" ref="name" placeholder="Username" />
        </form>
      </div>
    );
  }
}

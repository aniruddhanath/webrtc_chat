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
      <div class="form-group">
        <form onSubmit={this.onSubmit.bind(this)}>
          <label class="control-label" for="name">Name</label>
          <input class="form-control" ref="name" id="name" type="text" placeholder="Type your name and hit enter!" />
        </form>
      </div>
    );
  }
}

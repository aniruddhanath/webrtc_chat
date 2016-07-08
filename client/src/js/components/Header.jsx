import React from "react";

import Users from '../stores/UsersStore';

export default class Header extends React.Component {
  constructor() {
    super();
    this.state = { user: undefined };
  }

  componentWillMount() {
    const self = this;

    Users.on("loggedin", function () {
      self.setState({ user: Users.current() });
    });
  }

  componentWillUnmount() {
    Users.removeListener("loggedin");
  }

  render() {
    let sub = (
      <p>Please enter your name to continue.</p>
    );
    if (this.state.user) {
      sub = (
        <p>Howdy <span class="text-primary">{this.state.user.name}</span>! Hope you have a good experience.</p>
      );
    }
    return (
      <div class="page-header">
        <h2>WebRTC Chat App</h2>
        {sub}
      </div>
    );
  }
}

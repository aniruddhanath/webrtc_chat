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
    let title = (
      <h2>WebRTC Chat</h2>
    );
    if (this.state.user) {
      title = (
        <div>
          <h2>Howdy <span class="text-primary">{this.state.user.name}</span>!</h2>
          <p class="text-muted">Hope is good thing to start with.</p>
        </div>
      );
    }
    return (
      <div class="page-header text-center">
        {title}
      </div>
    );
  }
}

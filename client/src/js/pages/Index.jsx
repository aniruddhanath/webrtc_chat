import React from "react";

import UserList from "../components/Users/UserList.jsx";
import UserForm from "../components/Users/UserForm.jsx";
import UserCall from "../components/Users/UserCall.jsx";
import MessageList from "../components/Messages/MessageList.jsx";
import MessageForm from "../components/Messages/MessageForm.jsx";

import * as SocketActions from '../actions/SocketActions';
import * as RTCActions from '../actions/RTCActions';

import Users from '../stores/UsersStore';
import Call from '../stores/CallStore';
import Messages from '../stores/MessagesStore';

export default class Index extends React.Component {
  constructor() {
    super();

    this.state = {
      messages: Messages.all(),
      users: Users.fetch(),
      user: Users.current(),
      call: {},
      isInitiator: true,
      connectionEstablished: false
    }
  }

  componentWillMount() {
    var self = this;

    Users.on("reloaded", function () {
      self.setState({ users: Users.all() });
    });

    Users.on("loggedin", function () {
      self.setState({ user: Users.current() });
    });

    Call.on("incoming", function () {
      self.setState({
        call: Call.incomingCall(),
        isInitiator: false
      });
    });

    Call.on("ready", function (data) {
      RTCActions.createPeerConnection(data.room, data.isInitiator);
      self.setState({ connectionEstablished: true });
    });

    Call.on("signaling", function (message) {
      SocketActions.send("signalingMessage", message);
    });

    Call.on("signaled", function (message) {
      RTCActions.signalingMessageCallback(message);
    });

    Call.on("opened", function (data) {
      self.setState({ connectionEstablished: true });
    });

    Messages.on("added", function () {
      self.setState({ messages: Messages.all() });
    });
  }

  componentWillUnmount() {
    Users.removeListener("reloaded");
    Users.removeListener("loggedin");
    Call.removeListener("incoming");
    Call.removeListener("ready");
    Call.removeListener("signaling");
    Call.removeListener("signaled");
    Call.removeListener("opened");
    Messages.removeListener("added");
  }

  onLoggedIn(user) {
    this.setState({user: user});
  }

  emit(eventName, payload) {
    SocketActions.send(eventName, payload);
  }

  send(payload) {
    RTCActions.send(payload);
  }

  render() {
    if (!this.state.user) {
      return (
        <UserForm emit={this.emit.bind(this)} />
      )
    }

    return (
      <div>
        <h4>Welcome {this.state.user.name}</h4>
        <div>
          <UserList users={this.state.users} emit={this.emit.bind(this)} />
        </div>
        <UserCall call={this.state.call} emit={this.emit.bind(this)} />
        <div>
          <MessageList messages={this.state.messages} connectionEstablished={this.state.connectionEstablished} />
          <MessageForm send={this.send.bind(this)} user={this.state.user} connectionEstablished={this.state.connectionEstablished} />
        </div>
      </div>
    );
  }
}

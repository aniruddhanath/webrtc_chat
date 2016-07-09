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
      caller: {},
      callee: {},
      room: null,
      isInitiator: true,
      connectionEstablished: false
    };
  }

  componentWillMount() {
    const self = this;

    Users.on("reloaded", function () {
      self.setState({ users: Users.all() });
    });

    Users.on("loggedin", function () {
      self.setState({ user: Users.current() });
    });

    Call.on("incoming", function () {
      const call = Call.incomingCall();
      self.setState({
        caller: call.caller,
        room: call.room,
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

    Call.on("disconnect", function () {
      Messages.reset();
      Call.reset();
      self.setState({
        messages: Messages.all(),
        caller: {},
        callee: {},
        room: null,
        isInitiator: true,
        connectionEstablished: false
      });
      RTCActions.close();
    });

    Messages.on("added", function () {
      self.setState({ messages: Messages.all() });
    });

    self.timer = setInterval(function () {
      self.setState({ messages: Messages.all() });
    }, 1000);
  }

  componentWillUnmount() {
    Users.removeListener("reloaded");
    Users.removeListener("loggedin");
    Call.removeListener("incoming");
    Call.removeListener("ready");
    Call.removeListener("signaling");
    Call.removeListener("signaled");
    Call.removeListener("opened");
    Call.removeListener("disconnect");
    Messages.removeListener("added");
    clearInterval(this.timer);
  }

  emit(eventName, payload) {
    SocketActions.send(eventName, payload);
  }

  send(payload) {
    RTCActions.send(payload);
  }

  startCall(user, room) {
    const self = this;
    this.setState({
      room,
      callee: user
    });
    this.emit("startCall", {
      room,
      caller: self.state.user,
      callee: user
    });
  }

  render() {
    if (!this.state.user) {
      return (
        <UserForm emit={this.emit.bind(this)} />
      )
    }

    let header = "Make a call buddy!";
    let peer = this.state.isInitiator ? this.state.callee.name : this.state.caller.name
    if (this.state.connectionEstablished) {
      header = (
        <div>
          Ongoing call {this.state.isInitiator ? "to" : "from"} <span class="text-primary">{peer}</span>!
        </div>
      );
    }

    return (
      <div class="row">
        <div class="col-md-4">
          <UserList users={this.state.users}
            startCall={this.startCall.bind(this)}
            emit={this.emit.bind(this)}
            caller={this.state.caller}
            callee={this.state.callee}
            room={this.state.room}
            connectionEstablished={this.state.connectionEstablished}/>
        </div>

        <div class="col-md-8">
          <div class="panel panel-default">
            <div class="panel-heading">
              <h3 class="panel-title">{header}</h3>
            </div>
            <div class="panel-body">
              <UserCall room={this.state.room}
                caller={this.state.caller}
                emit={this.emit.bind(this)}
                connectionEstablished={this.state.connectionEstablished} />
              <MessageList messages={this.state.messages}
                currentUser={this.state.user}
                connectionEstablished={this.state.connectionEstablished} />
              <MessageForm send={this.send.bind(this)}
                user={this.state.user}
                connectionEstablished={this.state.connectionEstablished} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

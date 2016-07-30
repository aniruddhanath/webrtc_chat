import React from "react";

import Message from "./Message.jsx";

export default class MessageList extends React.Component {
  constructor() {
    super();
  }

  render() {
    if (!this.props.connectionEstablished) {
      return (
        <div></div>
      )
    }
    
    const messageList = this.props.messages.map((message, i) => {
      const localMessage = message.user.sid === this.props.currentUser.sid;
      return <Message message={message} key={i} localMessage={localMessage} />
    });

    const welcome = messageList.length ? "" : "Start sending messages!";
    const peer = this.props.isInitiator ? this.props.callee.name : this.props.caller.name;
    const peerIsTyping = this.props.peerIsTyping ? peer + " is typing.." : "";

    return (
      <div>
        <p class="text-center lead">{welcome}</p>
        {messageList}
        <p class="text-muted">{peerIsTyping}</p>
      </div>
    );
  }
}

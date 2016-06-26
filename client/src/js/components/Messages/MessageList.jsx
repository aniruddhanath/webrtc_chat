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
      return <Message message={message} key={i} />
    });
    return (
      <div>
        <h4>Messages</h4>
        {messageList}
      </div>
    );
  }
}

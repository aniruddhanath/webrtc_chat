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

    return (
      <div>
        {messageList}
      </div>
    );
  }
}

import React from "react";

export default class Message extends React.Component {
  constructor() {
    super();
  }

  formatTime(timeStamp) {
    return timeStamp;
  }

  render() {
    const formatedTime = this.formatTime(this.props.message.timeStamp);
    return (
      <div>
        <p>{this.props.message.user.name} - {this.props.message.text} - {formatedTime}</p>
      </div>
    );
  }
}

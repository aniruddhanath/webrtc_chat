import React from "react";
import * as Utils from "../../lib/Utils";

export default class Message extends React.Component {
  constructor() {
    super();
  }

  render() {
    const formatedTime = Utils.formatTime(this.props.message.timeStamp);
    const className = "well well-sm " + (this.props.localMessage ? "pull-right" : "pull-left");
    return (
      <div>
        <div class={className}>
          <p>{this.props.message.text}</p> <small class="pull-right">{formatedTime}</small>
        </div>
        <div class="clearfix"></div>
      </div>
    );
  }
}

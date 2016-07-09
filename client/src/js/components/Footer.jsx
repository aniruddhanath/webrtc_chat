import React from "react";

export default class Footer extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <footer>
        <hr />
        <p class="text-muted">Created for educational purpose by <a href="https://github.com/aniruddhanath/webrtc_chat">Aniruddha</a>.</p>
      </footer>
    );
  }
}

require('webrtc-adapter');
import { EventEmitter } from "events";
import * as Log from "../actions/LogActions";
import dispatcher from "../dispatcher";

class WebRtc extends EventEmitter {
  constructor() {
    super();
    // Using SCTP based data channels
    // SCTP is supported from Chrome 31 and is supported in FF.
    // No need to pass DTLS constraint as it is on by default in Chrome 31.
    // For SCTP, reliable and ordered is true by default.
    var servers = null,
      pcConstraint = null,
      dataConstraint = null,
      localConnection,
      sendChannel,
      receiveChannel;

    this.createConnection = this.createConnection.bind(this);
  }

  createConnection() {
    // Add localConnection
    this.localConnection = new RTCPeerConnection(this.servers, this.pcConstraint);
    Log.append('Created local peer connection object localConnection');
    this.sendChannel = this.localConnection.createDataChannel('sendDataChannel', this.dataConstraint);
    Log.append('Created send data channel');

    this.localConnection.onicecandidate = this.iceCallback1.bind(this);
    this.sendChannel.onopen = this.onSendChannelStateChange.bind(this);
    this.sendChannel.onclose = this.onSendChannelStateChange.bind(this);

    // Add remoteConnection
    this.remoteConnection = new RTCPeerConnection(this.servers, this.pcConstraint);
    Log.append('Created remote peer connection object remoteConnection');

    this.remoteConnection.onicecandidate = this.iceCallback2.bind(this);
    this.remoteConnection.ondatachannel = this.receiveChannelCallback.bind(this);

    this.localConnection.createOffer(this.gotDescription1.bind(this), this.onCreateSessionDescriptionError.bind(this));
  }

  handleActions(action) {
    switch(action.id) {
      case "LOGIN": {
        console.log("here");
        break;
      }
    }
  }

  onSendChannelStateChange() {
    var readyState = this.sendChannel.readyState;
    Log.append('Send channel state is: ' + readyState);
    if (readyState === 'open') {
      // enable the send button
    } else {
      // disable the send button
    }
  }

  onReceiveChannelStateChange() {
    var readyState = this.receiveChannel.readyState;
    Log.append('Receive channel state is: ' + readyState);
  }

  onReceiveMessageCallback(event) {
    Log.append('Received Message ' + event.data);
  }

  receiveChannelCallback(event) {
    Log.append('Receive Channel Callback');
    this.receiveChannel = event.channel;
    this.receiveChannel.onmessage = this.onReceiveMessageCallback;
    this.receiveChannel.onopen = this.onReceiveChannelStateChange.bind(this);
    this.receiveChannel.onclose = this.onReceiveChannelStateChange.bind(this);
  }

  onAddIceCandidateSuccess() {
    Log.append('AddIceCandidate success.');
  }

  onAddIceCandidateError(error) {
    Log.append('Failed to add Ice Candidate: ' + error.toString());
  }

  iceCallback1(event) {
    Log.append('local ice callback');
    if (event.candidate) {
      this.remoteConnection.addIceCandidate(event.candidate, this.onAddIceCandidateSuccess.bind(this), this.onAddIceCandidateError.bind(this));
      Log.append('Local ICE candidate: \n' + event.candidate.candidate);
    }
  }

  iceCallback2(event) {
    Log.append('remote ice callback');
    if (event.candidate) {
      this.localConnection.addIceCandidate(event.candidate, this.onAddIceCandidateSuccess.bind(this), this.onAddIceCandidateError.bind(this));
      Log.append('Remote ICE candidate: \n ' + event.candidate.candidate);
    }
  }

  gotDescription1(desc) {
    this.localConnection.setLocalDescription(desc);
    Log.append('Offer from localConnection \n' + desc.sdp);
    this.remoteConnection.setRemoteDescription(desc);
    this.remoteConnection.createAnswer(this.gotDescription2.bind(this), this.onCreateSessionDescriptionError.bind(this));
  }

  gotDescription2(desc) {
    this.remoteConnection.setLocalDescription(desc);
    Log.append('Answer from remoteConnection \n' + desc.sdp);
    this.localConnection.setRemoteDescription(desc);
  }

  onCreateSessionDescriptionError(error) {
    Log.append('Failed to create session description: ' + error.toString());
  }
}

const webRtc = new WebRtc;
dispatcher.register(webRtc.handleActions.bind(webRtc));

export default webRtc;

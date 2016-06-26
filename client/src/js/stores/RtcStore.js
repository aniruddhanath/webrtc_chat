require('webrtc-adapter');
import { EventEmitter } from "events";
import * as Socket from "../lib/SocketUtils";
import dispatcher from "../dispatcher";

class WebRtc extends EventEmitter {
  constructor() {
    super();

    // using google public stun server 
    this.configuration = { 
      "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }] 
    };
    
    this.pcConstraint = {
      optional: [{ RtpDataChannels: true }]
    };

    this.dataConstraint = { reliable: true };
  }

  startRtc() {
    var context = this;
    this.localConnection = new RTCPeerConnection(this.configuration, this.pcConstraint);
    console.log('created local peer connection object localConnection');

    // creating data channel
    this.sendChannel = this.localConnection.createDataChannel('sendDataChannel', this.dataConstraint);
    console.log('created send data channel');

    this.sendChannel.onerror = function (error) {
      this.emit("rtc_error", error);
      console.log("error:", error);
    };

    this.sendChannel.onmessage = function (event) {
      this.emit("rtc_message", event);
    };

    this.sendChannel.onclose = function () {
      this.emit("rtc_closed", event);
      console.log("data channel is closed");
    };

    // setup ice handling
    this.localConnection.onicecandidate = function (event) {
      console.log('local ice callback');
      if (event.candidate) {
        Socket.send({
          type: "candidate",
          candidate: event.candidate
        });
      }
    };

    this.localConnection.createOffer(function (offer) { 
      Socket.send({ 
        type: "offer",
        offer: offer
      }); 
      context.localConnection.setLocalDescription(offer);
    }, function (error) { 
      alert("error when creating an offer");
    });

  }

  handleActions(payload) {
    switch(payload.id) {
      case "LOGIN": {
        this.emit("logged_in", payload.success);
        break;
      }
      case "OFFER": {
        console.log("handle offer");
        break;
      }
    }
  }
}

const webRtc = new WebRtc;
dispatcher.register(webRtc.handleActions.bind(webRtc));

export default webRtc;


// mishra 8974782981, 8472001530
// bhabani 9869236566

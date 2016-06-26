require("webrtc-adapter");
import dispatcher from "../dispatcher";

var chat_room,
  isInitiator = true,
  config = { 'iceServers': [{'url': 'stun:stun.l.google.com:19302'}] },
  peerConnection = undefined,
  dataChannel = undefined,
  channel = "text";

function _onDataChannelCreated(channel) {
  console.log('onDataChannelCreated:', channel);
  channel.onopen = function () {
    console.log('CHANNEL opened!!');
    // dispatch
    dispatcher.dispatch({
      _id: "Call:Opened"
    });
  };
  channel.onmessage = function (event) {
    console.log("from remote - ", event);
    // dispatch
    dispatcher.dispatch({
      _id: "Message:Remote",
      message: JSON.parse(event.data)
    });
  };
}

function _sendMessage(message) {
  console.log('Client sending signaling message: ', message);
  // dispatch
  dispatcher.dispatch({
    _id: "Call:Signaling",
    room: chat_room,
    message
  });
}

function _onLocalSessionCreated(desc) {
  console.log('local session created:', desc);
  peerConnection.setLocalDescription(desc, function() {
    console.log('sending local desc:', peerConnection.localDescription);
    _sendMessage(peerConnection.localDescription);
  }, _logError);
}

function _logError(err) {
  console.log(err.toString(), err);
}

export function createPeerConnection(room, is_initiator) {
  chat_room = room;
  console.log(is_initiator);
  isInitiator = is_initiator;
  console.log('Creating Peer connection as initiator?', isInitiator, 'config:', config);
  peerConnection = new RTCPeerConnection(config);

  // send any ice candidates to the other peer
  peerConnection.onicecandidate = function (event) {
    console.log('onIceCandidate event:', event);
    if (event.candidate) {
      _sendMessage({
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate
      });
    } else {
      console.log('End of candidates.');
    }
  };

  if (isInitiator) {
    console.log('Creating Data Channel', channel);

    dataChannel = peerConnection.createDataChannel(channel);
    _onDataChannelCreated(dataChannel);

    console.log('Creating an offer');
    peerConnection.createOffer(_onLocalSessionCreated, _logError);
  } else {
    peerConnection.ondatachannel = function (event) {
      console.log('ondatachannel:', event.channel);
      dataChannel = event.channel;
      _onDataChannelCreated(dataChannel);
    };
  }
}

export function signalingMessageCallback(message) {
  
  if (message.type === 'offer') {
    console.log('Got offer. Sending answer to peer.');
    peerConnection.setRemoteDescription(new RTCSessionDescription(message), function() {
      // do nothing
    }, _logError);
    peerConnection.createAnswer(_onLocalSessionCreated, _logError);

  } else if (message.type === 'answer') {
    console.log('Got answer.');
    peerConnection.setRemoteDescription(new RTCSessionDescription(message), function() {
      // do nothing
    }, _logError);

  } else if (message.type === 'candidate') {
    peerConnection.addIceCandidate(new RTCIceCandidate({candidate: message.candidate}));

  } else if (message === 'bye') {
    // TODO: cleanup RTC connection
  }
}

export function send(message) {
  // TODO: wrap in try-catch block
  dataChannel.send(JSON.stringify(message));
  console.log("local - ", message);
  // dispatch
    dispatcher.dispatch({
      _id: "Message:Local",
      message: message
    });
}

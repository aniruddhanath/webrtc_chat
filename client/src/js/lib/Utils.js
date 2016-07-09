import moment from "moment";

export function generateToken() {
  return Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);
}

export function formatTime(timestamp) {
  return moment(timestamp).fromNow(true);
}

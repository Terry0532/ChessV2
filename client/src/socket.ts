import socketIOClient from "socket.io-client";

const getServerURL = () => {
  if (process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:4445";
  }
  // In production, connect to the same origin (Render domain)
  return window.location.origin;
};

const URL = getServerURL();

export const socket = socketIOClient(URL, { autoConnect: false });

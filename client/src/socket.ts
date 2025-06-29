import socketIOClient from "socket.io-client";

const url = process.env.NODE_ENV === "test" ? "" : "http://127.0.0.1:4445";
// "undefined" means the URL will be computed from the `window.location` object
const URL = "http://127.0.0.1:4445";

export const socket = socketIOClient(URL, { autoConnect: false });

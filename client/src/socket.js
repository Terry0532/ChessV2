import socketIOClient from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = 'http://127.0.0.1:4444';

export const socket = socketIOClient(URL, { autoConnect: false });

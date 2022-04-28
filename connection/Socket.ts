import io from 'socket.io-client';
/*
Local Test : http://localhost:3000
Server Test : https://chatzip-signalling-server.herokuapp.com
*/
export default io('https://chatzip-signalling-server.herokuapp.com', { 
    transports: ["websocket"],
    closeOnBeforeunload: false
});
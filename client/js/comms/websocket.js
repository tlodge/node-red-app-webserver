import io from 'socket.io-client';
import { newMessage } from '../actions/AppActions';

export default function init(namespace, appId, dispatch) {

  //deal with the reverse proxying of container manager by making socket.io path relative
  let pathname = "";

  const paths = window.location.pathname.split("/");

  if (paths.length > 1) {
    if (paths[paths.length - 2] != "") {
      pathname = `/${paths[paths.length - 2]}`;
    }
  }

  console.log(`initing socket with /${namespace} and path ${pathname}/ui/socket.io`);

  const socket = io('/' + namespace, { path: `${pathname}/ui/socket.io` });

  socket.on("connect", function () {
    console.log(`---> seen connect from server: ${appId} <---`);
    socket.emit("join", appId);
  });

  socket.on("message", function (data) {
    dispatch(newMessage(data));
  });

};


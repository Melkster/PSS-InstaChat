import io from "socket.io-client";
socket = io("http://130.243.203.248:3000/"); // You need to change this to your server ip
module.exports = socket;

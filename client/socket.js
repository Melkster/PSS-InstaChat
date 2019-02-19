import io from "socket.io-client";
socket = io("http://192.168.0.104:3000/"); // You need to change this to your server ip
module.exports = socket;
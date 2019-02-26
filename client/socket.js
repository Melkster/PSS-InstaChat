import io from "socket.io-client";
import {
    Alert
} from "react-native";

socket = io("http://192.168.0.104:3000/"); // You need to change this to your server ip

// Alerts the user if they can't connect to the server
socket.on("connect_error", error => {
    Alert.alert("Couldn't connect to server");
});

// Error event handler, prints an Alert with the provided message
socket.on("err", data => {
    Alert.alert(data);
});

module.exports = socket;
import io from "socket.io-client";
import { Alert } from "react-native";

socket = io("http://192.168.0.109:3000/"); // You need to change this to your server ip

var connect_error = false; // Ensures that an error connecting only is alerted once

// Alerts the user if they can't connect to the server
socket.on("connect_error", error => {
    if (connect_error == false) {
        Alert.alert("Error", "Could not connect to server");
        connect_error = true;
    }
});

socket.on("connect", () => {
    if (connect_error == true) {
        Alert.alert("Success", "Reconnected with server");
        connect_error = false;
    }
});

// Error event handler, prints an Alert with the provided message
socket.on("err", data => {
    Alert.alert("Server error", data);
});

module.exports = socket;

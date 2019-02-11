const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const DBManager = require("./DBManager.js");

const port = 3000;

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

const database = new DBManager();
var users = [];
var messages = [];

io.on("connection", socket => {
    console.log(`A user connected, socket ID ${socket.id}`);

    socket.on("setUsername", username => {
        console.log(username);

        if (users.indexOf(username) > -1) {
            socket.emit("err", username + " username is taken! Try some other username.");
        } else {
            users.push(username);
            socket.emit("userSet", { username: username });
        }

        // After a new user joins, send them all previous messages
        for (message of messages) {
            socket.emit("message", message);
        }
    });

    socket.on("message", data => {
        data.time = new Date(); // Adds time received to message
        messages.push(data);
        io.sockets.emit("message", data);
    });

    socket.on("disconnect", () => {
        console.log(`A user disconnected, socket ID ${socket.id}`);
    });
});

http.listen(port, () => {
    console.log(`Listening on localhost:${port}`);
});

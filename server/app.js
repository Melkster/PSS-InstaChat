var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

const port = 3000;

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

users = [];

io.on("connection", socket => {
    console.log(`A user connected, socket ID ${socket.id}`);
    socket.on("setUsername", username => {
        console.log(username);

        if (users.indexOf(username) > -1) {
            socket.emit("userExists", username + " username is taken! Try some other username.");
        } else {
            users.push(username);
            socket.emit("userSet", { username: username });
        }
    });

    socket.on("message", data => {
        io.sockets.emit("message", data);
    });

    socket.on("disconnect", (foo, bar) => {
        console.log(`A user disconnected, socket ID ${socket.id}`);
    });
});

http.listen(port, () => {
    console.log(`Listening on localhost:${port}`);
});

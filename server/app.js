var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

const port = 3000;

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

users = [];

io.on("connection", socket => {
    console.log("A user connected");
    socket.on("setUsername", data => {
        console.log(data);

        if (users.indexOf(data) > -1) {
            socket.emit("userExists", data + " username is taken! Try some other username.");
        } else {
            users.push(data);
            socket.emit("userSet", { username: data });
        }
    });

    socket.on("message", data => {
        //Send message to everyone
        io.sockets.emit("message", data);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

http.listen(port, () => {
    console.log(`Listening on localhost:${port}`);
});

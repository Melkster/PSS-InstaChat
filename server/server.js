const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const DBManager = require("./DBManager.js");

const port = 3000;

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

const database = new DBManager();
database.initDatabase();

io.on("connection", socket => {
    // TODO: redownload history when user enters a chat
    // TODO: add time stamp to messages when received

    console.log(`A user connected, socket ID ${socket.id}`);

    socket.on("identificaiton", (userID, chatIDs) => {
        if (userID == null) {
            userID = DBManager.sRandomBigValue(); // generate new userID here
            socket.emit("identificaiton", userID);
            // TODO: should users be saved in the database if they haven't joined any chat room?
        } else {
            if (chatIDs != null && chatIDs.length > 0) {
                for (chatID of chatIDs) {
                    socket.join(chatID);
                }
            }
        }
    });

    socket.on("joinChat", (userID, userName, chatID) => {
        result = database.addUser(userID, userName, chatID);
        if (result == false) {
            socket.emit("err", `Could not join chat with chat ID "${chatID}"`);
        } else {
            socket.join(chatID);
            console.log(`User with userID ${userID} joined chat ${chatID}`);
        }
    });

    socket.on("leaveChat", () => {
        // TODO
    });

    socket.on("createChat", chatName => {
        chatID = database.createChat(chatName);
        if (chatID == false) {
            socket.emit("err", `Could not create chat "${chatName}"`);
        } else {
            socket.emit("createChat", chatID);
        }
    });

    socket.on("message", data => {
        // TODO: change userID to userName
        // data.time = new Date(); // Adds time received to message
        console.log(data);
        database.addMessage(data.message, data.userid, data.chatid);
        //socket.emit('message', "hej");
        socket.to(data.chatID).emit("message", data);
    });

    socket.on("disconnect", () => {
        console.log(`A user disconnected, socket ID ${socket.id}`);
    });
});

http.listen(port, () => {
    console.log(`Listening on localhost:${port}`);
});

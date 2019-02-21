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

    /**
     * On an `identification` event, the server expects two arguments from the
     * client: `userID` and `chatIDs`. If the client has no `userID` it should
     * set `userID = null`, and the server will respond with an `identificaiton`
     * event containing a `userID`.
     */
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

    /**
     * For the client to join a chat, use the `joinChat` event. Provide a
     * `userID`, `userName` and the `chatID` of the chat to join. If there was
     * a problem joining the chat, the server will respond with an `err` event
     * and an error message. Otherwise, the server will respond with the
     * `chatID` of the joined chat.
     */
    socket.on("joinChat", (userID, userName, chatID) => {
        result = database.addUser(userID, userName, chatID);
        if (result == false) {
            socket.emit("err", `Could not join chat with chat ID "${chatID}"`);
        } else {
            socket.join(chatID);
            socket.emit("joinChat", chatID);
            console.log(`User with userID ${userID} joined chat ${chatID}`);
        }
    });

    socket.on("leaveChat", () => {
        // TODO
    });

    /**
     * To create a chat, use the `createChat` event. Provide the name of the
     * chat; `chatName`. If a problem occurred, the server will respond with
     * an `err` event and an error message. Otherwise, the server will respond
     * with the `chatID` of the created chat.
     */
    socket.on("createChat", chatName => {
        chatID = database.createChat(chatName);
        if (chatID == false) {
            socket.emit("err", `Could not create chat "${chatName}"`);
        } else {
            socket.emit("createChat", chatID);
        }
    });

    /**
     * A client can send a message using the `message` event. The message should
     * be a stringified JSON object with the following structure:
     * ```
     * {
     *     author: {
     *         userID: *userID*,
     *         username: *username*
     *     },
     *     chatID: *chatID*,
     *     message: *message*,
     *     time: *time*
     * }
     * ```
     * If the message could not be stored in the database, the server will
     * respond with an `err` event.
     */
    socket.on("message", messageWrapper => {
        // TODO: change userID to userName before transmitting message
        // messageWrapper.time = new Date(); // Adds time received to message
        messageWrapper = JSON.parse(messageWrapper);

        if (!messageWrapper.hasOwnProperty("message")) {
            socket.emit("err", "The message sent contains no 'message' field");
        } else if (!messageWrapper.hasOwnProperty("chatID")) {
            socket.emit("err", "The message sent has no userID");
        } else if (!messageWrapper.hasOwnProperty("author")) {
            socket.emit("err", "The message sent has no author");
        } else if (!messageWrapper.author.hasOwnProperty("userID")) {
            socket.emit("err", "The message sent has no userID");
        } else if (!messageWrapper.author.hasOwnProperty("username")) {
            socket.emit("err", "The message sent has no username");
        } else {
            console.log(`Received message: '${messageWrapper.message}' from userID ${messageWrapper.author.userID}`);
            result = database.addMessage(messageWrapper.message, messageWrapper.author.userID, messageWrapper.chatID);
            if (result == false) {
                socket.emit("err", `Could not store message in server database`);
            } else {
                io.to(messageWrapper.chatID).emit("message", messageWrapper);
            }
        }
    });

    socket.on("disconnect", () => {
        console.log(`A user disconnected, socket ID ${socket.id}`);
    });
});

http.listen(port, () => {
    console.log(`Listening on localhost:${port}`);
});

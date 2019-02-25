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
    // TODO: add time stamp to messages when received

    console.log(`A user connected, socket ID ${socket.id}`);

    /**
     * On an `identification` event, the server expects two arguments from the
     * client: `userID` and `chatIDs`. If the client has no `userID` it should
     * set `userID = null`, and the server will respond with an `identification`
     * event containing a `userID`.
     */
    socket.on("identification", (userID, chatIDs) => {
        if (userID == null) {
            userID = DBManager.sRandomBigValue(10); // generate new userID here
            socket.emit("identification", userID);
            // TODO: should users be saved in the database if they haven't joined any chat room?
        } else {
            if (chatIDs != null && chatIDs.length > 0) {
                for (chatID of chatIDs) {
                    // TODO: check that `userID` is in `chatID` exists in db using `checkUser()`
                    socket.join(chatID);
                    // TODO: handle errors
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
        result = database.addUser(userID, userName, chatID, (err, name) => {
            if (err) {
                console.error(err.message);
                success = false;
                return false;
            } else {
                socket.emit("joinChat", name);
            }
        });
        if (result == false) {
            socket.emit("err", `Could not join chat with chat ID "${chatID}"`);
        } else {
            socket.join(chatID);
            // TODO: emit the `chatName` instead
            socket.emit("joinChat", chatID);
            console.log(`User with userID ${userID} joined chat ${chatID}`);
        }
    });

    socket.on("leaveChat", () => {
        // TODO
    });

    /**
     * The `fetchMessages` event is used to retrieve all old messages for a chat
     * with `chatID`. The server will transmit all old messages chronologically,
     * one by one, using the `message` event.
     */
    socket.on("fetchMessages", chatID => {
        database.getMessages(chatID, (err, messages) => {
            if (err) {
                console.log(err.message);
                socket.emit("err", "An occurred while fetching old messages.")
            } else {
                for (message of messages) {
                    // TODO: should chatID be added to every message? Doesn't seem to be actually needed.
                    // TODO: replace `userID` with `username` in all messages
                    io.to(chatID).emit("message", message);
                }
            }
        });
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
            console.log(`Created chat '${chatName}'`);
        }
    });

    /**
     * A client can send a message using the `message` event. The message should
     * be a stringified JSON object with the following structure:
     * ```
     * {
     *     userID: *userID*,
     *     chatID: *chatID*,
     *     message: *message*,
     * }
     * The transmitted message looks like this:
     * {
     *    username: *username*,
     *    chatID: *chatID*,
     *    message: *message*,
     *    time: *time*
     * }
     * ```
     * If the message could not be stored in the database, the server will
     * respond with an `err` event.
     */
    socket.on("message", messageWrapper => {
        // TODO: change userID to userName before transmitting message
        // messageWrapper.time = new Date(); // Adds time received to message
        messageWrapper = JSON.parse(messageWrapper);

        database.checkUser(messageWrapper.userID, messageWrapper.chatID, (err, username) => {
            if (err) {
                socket.emit("err", err);
                console.log(err);
            } else {
                if (!messageWrapper.hasOwnProperty("message")) {
                    socket.emit("err", "The message sent contains no 'message' field");
                } else if (!messageWrapper.hasOwnProperty("chatID")) {
                    socket.emit("err", "The message sent has no userID");
                } else if (!messageWrapper.hasOwnProperty("userID")) {
                    socket.emit("err", "The message sent has no userID");
                } else if (!messageWrapper.hasOwnProperty("username")) {
                    socket.emit("err", "The message sent has no username");
                } else {
                    console.log(`Received message: '${messageWrapper.message}' from userID ${messageWrapper.userID}`);
                    result = database.addMessage(messageWrapper.message, messageWrapper.userID, messageWrapper.chatID);
                    if (result == false) {
                        socket.emit("err", `Could not store message in server database`);
                    } else {
                        messageWrapper.username = username;
                        delete messageWrapper.userID;
                        io.to(messageWrapper.chatID).emit("message", JSON.stringify(messageWrapper));
                    }
                }
            }
        });
    });

    socket.on("disconnect", () => {
        console.log(`A user disconnected, socket ID ${socket.id}`);
    });
});

http.listen(port, "0.0.0.0", () => {
    console.log(`Listening on localhost:${port}`);
});

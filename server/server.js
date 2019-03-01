const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const DBManager = require("./DBManager.js");

const port = 3000;

const database = new DBManager();
database.initDatabase(function(err, status) {
    if (err) {
        console.error(err);
    } else {
        console.log("Database manager initialized successfully.");
    }
});

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
            database.createUser((err, userID) => {
                if (err) {
                    socket.emit("err", "Could not store user in database");
                    console.error(err.message);
                } else {
                    socket.emit("identification", userID);
                }
            });
        } else {
            if (chatIDs != null && chatIDs.length > 0) {
                for (chatID of chatIDs) {
                    console.log(chatID);
                    // TODO: check that `userID` is in `chatID` exists in db using `checkUser()`
                    socket.join(chatID);
                    // TODO: handle errors
                }
            }
        }
    });

    /**
     * For the client to join a chat, use the `joinChat` event. Provide a
     * `userID`, `username` and the `chatID` of the chat to join. If there was
     * a problem joining the chat, the server will respond with an `err` event
     * and an error message. Otherwise, the server will respond with the
     * `chatID` of the joined chat.
     */
    socket.on("joinChat", (userID, username, chatID) => {
        database.addUser(userID, username, chatID, (err, name) => {
            if (err) {
                socket.emit("err", `Could not join chat with chat ID "${chatID}"`);
                console.error(err.message);
            } else {
                socket.join(chatID);
                socket.emit("joinChat", name);
                console.log(`User with userID ${userID} joined chat ${chatID}`);
            }
        });
    });

    socket.on("leaveChat", () => {
        // TODO
    });

    function sendMessage(message, chatID) {
        database.checkUser(message.userID, chatID, (err, username) => {
            if (err) {
                socket.emit("err", err.message);
                console.error(err);
            } else {
                message.chatID = chatID; // TODO: should chatID be added to every message? Doesn't seem to be actually needed.
                message.username = username;
                delete message.userID;
                io.to(chatID).emit("message", JSON.stringify(message));
            }
        });

    }

    /**
     * The `fetchMessages` event is used to retrieve all old messages for a chat
     * with `chatID`. The server will transmit all old messages chronologically,
     * one by one, using the `message` event.
     */
    socket.on("fetchMessages", chatID => {
        database.getMessages(chatID, (err, messages) => {
            if (err) {
                console.log(err.message);
                socket.emit("err", "An occurred while fetching old messages.");
            } else {
                for (message of messages) {
                    sendMessage(message, chatID);
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
        database.createChat(chatName, (err, chatID) => {
            if (err) {
                console.error(err);
                socket.emit("err", `Could not create chat "${chatName}"`);
            } else {
                socket.emit("createChat", chatID);
                console.log(`Created chat '${chatName}'`);
            }
        });
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
        // messageWrapper.time = new Date(); // Adds time received to message
        messageWrapper = JSON.parse(messageWrapper);

        database.checkUser(messageWrapper.userID, messageWrapper.chatID, (err, username) => {
            // This looks up the users's username. However it seems like the username is currently sent by the user, should this be changed?
            if (err) {
                socket.emit("err", err.message);
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
                    database.addMessage(messageWrapper.message, messageWrapper.userID, messageWrapper.chatID, Date.now(), (err, status) => {
                        if (err) {
                            console.error(err.message);
                            socket.emit("err", `Could not store message in server database`);
                        } else {
                            messageWrapper.username = username;
                            delete messageWrapper.userID;
                            io.to(messageWrapper.chatID).emit("message", JSON.stringify(messageWrapper));
                        }
                    });
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

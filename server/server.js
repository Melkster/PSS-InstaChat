const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const DBManager = require("./DBManager.js");
const port = 3000;
const database = new DBManager();

database.initDatabase(true, err => {
    if (err) {
        console.error(err.message);
    } else {
        console.log("Database initialized.");
    }
});

io.on("connection", socket => {
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
                    database.checkUser(userID, chatID, (err, username) => {
                        if (err) {
                            socket.emit("err", `Could not connect to chat with chat ID ${chatID}`);
                            console.error(err.message);
                        } else {
                            socket.join(chatID);
                            console.log(`User ${userID} connected to chat ${chatID}`);
                        }
                    });
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
                sendEvent(`${username} joined.`, chatID, socket);
                console.log(`User with userID ${userID} joined chat ${chatID}`);
            }
        });
    });

    /**
     * To leave a chat use the `leaveChat` event. Provide a `userID` and the
     * `chatID` of the chat to leave. The server will respond with a `leaveChat`
     * event (with no additional data) if the chat was left successfully,
     * otherwise it will respond with an `err` event.
     */
    socket.on("leaveChat", (userID, chatID) => {
        // TODO: check if user `userID` is the last person in the chat, in that case call database.deleteChat
        database.checkUser(userID, chatID, (err, username) => {
            if (err) {
                socket.emit("err", err.message);
                console.error(err.message);
            } else {
                database.removeUser(userID, chatID, err => {
                    if (err) {
                        socket.emit("err", "Could not leave chat at this time, please try again later.");
                        console.error(err.message);
                    } else {
                        socket.leave(chatID);
                        socket.emit("leaveChat");
                        sendEvent(`${username} left.`, chatID, socket);
                        console.log("User left chat");
                    }
                });
            }
        });
    });

    /**
     * If `socket` is `null`, `message` will be transmitted to everyone in chat
     * `chatID`. Otherwise, if it is a socket object it will be transmitted
     * only to `socket`.
     */
    function sendMessage(messageWrapper, chatID, socket) {
        database.checkUser(messageWrapper.userID, chatID, (err, username) => {
            if (err) {
                socket.emit("err", err.message);
                console.error(err.message);
            } else {
                // TODO: should chatID be added to every message? Doesn't seem to be actually needed.
                messageWrapper.chatID = chatID;
                if (username == false) {
                    messageWrapper.username = "Removed user";
                } else {
                    messageWrapper.username = username;
                }
                if (messageWrapper.userID == 0) messageWrapper.event = true;
                delete messageWrapper.userID;
                messageWrapper = JSON.stringify(messageWrapper);
                if (socket) {
                    socket.emit("message", messageWrapper);
                } else {
                    io.to(chatID).emit("message", messageWrapper);
                }
            }
        });
    }

    /**
     * Sends event with the string `message` to chat `chatID`.
     * If `excludeSocket` is `null`, `message` is sent to all sockets connected to
     * `chatID`. Otherwise, if `excludeSocket` is a socket object, `message` is
     * sent to all sockets connected to `chatID`, except for `excludeSocket`.
     */
    function sendEvent(message, chatID, excludeSocket) {
        time = Date.now();

        database.addMessage(message, 0, chatID, time, err => {
            if (err) {
                console.error(err.message);
            } else {
                messageWrapper = JSON.stringify({
                    username: "event",
                    chatID: chatID,
                    message: message,
                    time: time,
                    event: true
                });
                if (excludeSocket) {
                    excludeSocket.broadcast.to(chatID).emit("message", messageWrapper);
                } else {
                    io.to(chatID).emit("message", messageWrapper);
                }
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
                console.error(err.message);
                socket.emit("err", "An occurred while fetching old messages.");
            } else {
                for (message of messages) {
                    sendMessage(message, chatID, socket);
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
                console.error(err.message);
                socket.emit("err", `Could not create chat "${chatName}"`);
            } else {
                socket.emit("createChat", chatID);
                console.log(`Created chat '${chatName}' with chatID ${chatID}`);
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
     *     message: *message*
     * }
     * ```
     * The message looks like this when the server transmits it:
     * ```
     * {
     *    username: *username*,
     *    chatID: *chatID*,
     *    message: *message*,
     *    time: *time*,
     *    event: *true/false*,
     * }
     * ```
     * If the message lacks some field or could not be stored in the database,
     * the server will respond with an `err` event.
     */
    socket.on("message", messageWrapper => {
        messageWrapper = JSON.parse(messageWrapper);

        if (!messageWrapper.hasOwnProperty("message")) {
            socket.emit("err", "The message sent contains no 'message' field");
        } else if (!messageWrapper.hasOwnProperty("chatID")) {
            socket.emit("err", "The message sent has no chatID");
        } else if (!messageWrapper.hasOwnProperty("userID")) {
            socket.emit("err", "The message sent has no userID");
        } else {
            database.checkUser(messageWrapper.userID, messageWrapper.chatID, (err, username) => {
                if (err) {
                    socket.emit("err", err.message);
                    console.error(err.message);
                } else {
                    database.addMessage(messageWrapper.message, messageWrapper.userID, messageWrapper.chatID, Date.now(), err => {
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
            });
        }
    });

    socket.on("disconnect", () => {
        console.log(`A user disconnected, socket ID ${socket.id}`);
    });
});

http.listen(port, "0.0.0.0", () => {
    console.log(`Listening on localhost:${port}`);
});

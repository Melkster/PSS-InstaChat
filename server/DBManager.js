/** Interface to the database which manages chats and users */
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");

//var date = new Date();

var globalDB;
var chatDBs = {};

class DBManager {
    initDatabase() {
        let firstBoot = false;
        let success = true;
        if (fs.existsSync("./db/global.db")) {
            firstBoot = false;
        } else {
            firstBoot = true;
        }

        globalDB = new sqlite3.Database("./db/global.db", err => {
            if (err) {
                console.error(err.message);
                wasError = true;
            } else {
                console.log("Connected to global database.");
            }
        });

        if (firstBoot == true) {
            globalDB.serialize(() => {
                globalDB
                    .run("CREATE TABLE GlobalUsers (USERHASH INT     PRIMARY KEY      NOT NULL);", err => {
                        if (err) {
                            console.error(err.message);
                            success = false;
                        }
                    })
                    .run("CREATE TABLE GlobalChats (CHATHASH INT     PRIMARY KEY      NOT NULL, CHATNAME TEXT    NOT NULL);", err => {
                        if (err) {
                            console.error(err.message);
                            success = false;
                        }
                    })
                    .run("INSERT INTO GlobalUsers (USERHASH) VALUES(0);", err => {
                        if (err) {
                            console.error(err.message);
                            success = false;
                        }
                    });
            });
        }

        /*let user = DBManager.createUser();
        console.log("Created user " + user);
        let chat = DBManager.createChat("potato");
        let newuser = DBManager.addUser(user, "Mr. Person", chat);
        console.log("Added user " + newuser + " to chat " + chat);*/

        if (success == true) {
            return true;
        } else {
            return false;
        }
    }

    deinitDatabase() {
        // SLQ queries to deinitialize global database
        // return: true if deinitialized successfully, otherwise false
        // low priority
    }

    createChat(chatName) {
        var success = false;
        var chatID;
        var tries = 0;
        while (success == false) {
            success = true;
            chatID = DBManager.sRandomBigValue();
            globalDB.run("INSERT INTO GlobalChats (CHATHASH, CHATNAME) VALUES(?, ?);", [chatID, chatName], err => {
                if (err) {
                    success = false;
                    if (tries > 16) {
                        return false;
                    }
                    tries++;
                }
            });
        }

        if (success == false) {
            return false;
        }

        let newChatDB = new sqlite3.Database("./db/" + chatID + ".db", err => {
            if (err) {
                console.error(err.message);
                success = false;
            } else {
                console.log("Created database for chat " + chatID + ".");
            }
        });

        if (success == false) {
            return false;
        }

        newChatDB.run("ATTACH './db/global.db' as 'Global';", err => {
            if (err) {
                console.error(err.message);
                success = false;
                return false;
            }
        });

        newChatDB.serialize(() => {
            newChatDB
                .run(
                    "CREATE TABLE Users(USERHASH         INT     UNIQUE  NOT NULL, NAME             TEXT            NOT NULL, ONLINE           INT             NOT NULL, LASTONLINE       INT             NOT NULL);",
                    err => {
                        if (err) {
                            console.error("111: " + err.message);
                            success = false;
                            return false;
                        }
                    }
                )
                .run('INSERT INTO Users    VALUES(0, "Server", 1, (?));', [Date.now()], err => {
                    if (err) {
                        console.error("119: " + err.message);
                        success = false;
                        return false;
                    }
                });
        });

        if (success == true) {
            chatDBs[chatID] = newChatDB;
            return chatID;
        } else {
            return false;
        }
    }

    removeChat(chatID) {
        // SQL query to remove chat with `chatID`
        // return: true if removed successfully, otherwise false
        // low priority
    }

    createUser() {
        var success = false;
        var userID;
        var tries = 0;
        while (success == false) {
            success = true;
            userID = DBManager.sRandomBigValue();
            globalDB.run("INSERT INTO GlobalUsers (USERHASH) VALUES(?);", [userID], err => {
                if (err) {
                    success = false;
                    if (tries > 16) {
                        return false;
                    }
                    tries++;
                }
            });
        }

        if (success == true) {
            return userID;
        } else {
            return false;
        }
    }

    deleteUser(userID) {
        // SQL query to delete global user `userID`
        // return: true if deleted successfully, otherwise false
        // low priority
    }

    addUser(userID, userName, chatID) {
        var success = true;

        if (chatDBs[chatID] == undefined) {
            console.error("Error: Chat " + chatID + " does not exist");
            return false;
        }

        globalDB.get("SELECT * FROM GlobalUsers WHERE USERHASH = (?)", [userID], (err, row) => {
            if (err) {
                console.error("176: " + err.message);
                success = false;
                return false;
            }
            if (row == undefined) {
                console.error("Error: User " + userID + " does not exist");
                success = false;
                return false;
            }
        });

        if (success == false) {
            return false;
        }

        chatDBs[chatID].get("SELECT * FROM Users WHERE USERHASH = (?)", [userID], (err, row) => {
            if (err) {
                console.error(err.message);
                success = false;
                return false;
            }
            if (row != undefined) {
                console.error("Error: User " + userID + " is already a member of chat " + chatID);
                success = false;
                return false;
            }
        });

        if (success == false) {
            return false;
        }

        chatDBs[chatID].run("INSERT INTO Users    VALUES((?), (?), 1, (?));", [userID, userName, Date.now()], err => {
            if (err) {
                console.error(err.message);
                success = false;
                return false;
            }
        });

        if (success == true) {
            return userID;
        } else {
            return false;
        }
    }

    checkUser(userID, chatID) {
        // SQL query to check if user with `userID` exists in chat with `chatID`
        // (used to make sure users only post messages in chats they are actually in)
        // return: true if user exists in chatID, otherwise false
        // TODO
    }

    verifyUser(userID, userName, chatID) {
        // SQL query to verify that user with `userName` in chat `chatID`
        // actually has `userID` (used for authorization when user reconnects)
        // return: true if userName and userID match a user in chatID, otherwise false
        // low priority
    }

    removeUser(userID, chatID) {
        // SQL query to remove user with `userID` from chat with `chatID`
        // return: true if user was removed successfully, otherwise false
        // low priority
    }

    getAllUsers(chatID) {
        // SQL query to retreive all users with from chat with `chatID`
        // return: a list with all users
        // TODO
    }

    addMessage(message, userID, chatID) {
        // Adds `message` from user `userID` to chat with `chatID`
        // TODO
    }

    getMessages(chatID) {
        // SQL query to retreive chat history for chat with `chatID`
        // return: list of messages for chat with `chatID`
        // TODO
    }

    /* Utility functions below */

    static sRandomBigValue() {
        var array = crypto.randomBytes(32);
        var stringArray = [];
        for (var i = 0; i < array.length; i++) {
            stringArray.push(DBManager.U8ToHexString(array[i]));
        }
        return stringArray.join("");
    }

    static U8ToHexString(byte) {
        var string = "";
        var hiNybble = byte >> 4;
        var loNybble = byte - (hiNybble << 4);
        string = hiNybble.toString(16);
        return string.concat(loNybble.toString(16));
    }
}

module.exports = DBManager;

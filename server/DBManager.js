/** Interface to the database which manages chats and users */
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");

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
                success = false;
            } else {
                console.log("Connected to global database.");
            }
        });
        globalDB.serialize();

        if (success == false) {
            return false;
        }

        if (firstBoot == true) {
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
        }

        /*let user = this.createUser();
        console.log("Created user " + user);
        let chat = this.createChat("potato");
        let newuser = this.addUser(user, "Mr. Person", chat);
        console.log("Added user " + newuser + " to chat " + chat);
        this.getAllUsers(chat, console.log);
        this.addMessage("Hi!", user, chat);
        this.getMessages(chat, console.log);*/

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
        newChatDB.serialize();

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
                            console.error(err.message);
                            success = false;
                            return false;
                        }
                    }
                )
                .run('INSERT INTO Users    VALUES(0, "Server", 1, (?));', [Date.now()], err => {
                    if (err) {
                        console.error(err.message);
                        success = false;
                        return false;
                    }
                })
                .run(
                    "CREATE TABLE Messages(     USERHASH         INT     UNIQUE  NOT NULL,       MESSAGE  TEXT,       TIME     INT            NOT NULL);",
                    err => {
                        if (err) {
                            console.error(err.message);
                            success = false;
                            return false;
                        }
                    }
                )
                .run("INSERT INTO Messages    VALUES(0, 'Chat \"" + chatName + "\" created.', (?));", [Date.now()], err => {
                    if (err) {
                        console.error(err.message);
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

    createChat_debug(chatName, chatID) {
        var success = false;
        success = true;
        globalDB.run("INSERT INTO GlobalChats (CHATHASH, CHATNAME) VALUES(?, ?);", [chatID, chatName], err => {
            if (err) {
                success = false;
                return false;
            }
        });

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
        newChatDB.serialize();

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
                            console.error(err.message);
                            success = false;
                            return false;
                        }
                    }
                )
                .run('INSERT INTO Users    VALUES(0, "Server", 1, (?));', [Date.now()], err => {
                    if (err) {
                        console.error(err.message);
                        success = false;
                        return false;
                    }
                })
                .run(
                    "CREATE TABLE Messages(     USERHASH         INT     UNIQUE  NOT NULL,       MESSAGE  TEXT,       TIME     INT            NOT NULL);",
                    err => {
                        if (err) {
                            console.error(err.message);
                            success = false;
                            return false;
                        }
                    }
                )
                .run("INSERT INTO Messages    VALUES(0, 'Chat \"" + chatName + "\" created.', (?));", [Date.now()], err => {
                    if (err) {
                        console.error(err.message);
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

    createUser_debug(userID) {
        var success = false;
        success = true;
        globalDB.run("INSERT INTO GlobalUsers (USERHASH) VALUES(?);", [userID], err => {
            if (err) {
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

    deleteUser(userID) {
        // SQL query to delete global user `userID`
        // return: true if deleted successfully, otherwise false
        // low priority
    }

    addUser(userID, userName, chatID) {
        var success = true;

        if (chatDBs[chatID] == undefined) {
            console.error("Error: Chat " + chatID + " does not exist");
            success = false;
            return false;
        }

        if (success == false) {
            return false;
        }

        success = this.checkUser(userID, chatID);

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
        var success = true;

        if (chatDBs[chatID] == undefined) {
            console.error("Error: Chat " + chatID + " does not exist");
            success = false;
            return false;
        }

        if (success == false) {
            return false;
        }

        globalDB.get("SELECT * FROM GlobalUsers WHERE USERHASH = (?)", [userID], (err, row) => {
            if (err) {
                console.error(err.message);
                success = false;
                return false;
            }
            if (row == undefined) {
                console.error("Error: User " + userID + " does not exist");
                success = false;
                return false;
            }
        });

        return success;
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

    getAllUsers(chatID, callback) {
        var success = true;

        if (chatDBs[chatID] == undefined) {
            console.error("Error: Chat " + chatID + " does not exist");
            success = false;
            return false;
        }

        if (success == false) {
            return false;
        }

        chatDBs[chatID].all("SELECT * FROM Users", callback);

        return success;
    }

    addMessage(message, userID, chatID) {
        var success = true;

        if (chatDBs[chatID] == undefined) {
            console.error("Error: Chat " + chatID + " does not exist");
            success = false;
            return false;
        }

        if (success == false) {
            return false;
        }

        success = this.checkUser(userID, chatID);

        if (success == false) {
            return false;
        }

        chatDBs[chatID].run("INSERT INTO Messages (USERHASH, MESSAGE, TIME) VALUES ((?), (?), (?));", [userID, message, Date.now()], err => {
            if (err) {
                console.error(err.message);
                success = false;
                return false;
            }
        });

        return success;
    }

    getMessages(chatID, callback) {
        var success = true;

        if (chatDBs[chatID] == undefined) {
            console.error("Error: Chat " + chatID + " does not exist");
            success = false;
            return false;
        }

        if (success == false) {
            return false;
        }

        chatDBs[chatID].all("SELECT * FROM Messages", callback);

        return success;
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

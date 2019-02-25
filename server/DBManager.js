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
                .run("CREATE TABLE GlobalUsers (userID INT     PRIMARY KEY      NOT NULL);", err => {
                    if (err) {
                        console.error(err.message);
                        success = false;
                    }
                })
                .run("CREATE TABLE GlobalChats (chatID INT     PRIMARY KEY      NOT NULL, chatName TEXT    NOT NULL);", err => {
                    if (err) {
                        console.error(err.message);
                        success = false;
                    }
                })
                .run("INSERT INTO GlobalUsers (userID) VALUES(0);", err => {
                    if (err) {
                        console.error(err.message);
                        success = false;
                    }
                });
        }

        /*let user = this.createUser();
        console.log("Created user " + user);
        let chat = this.createChat("potato");
        let newuser = this.addUser(user, "Mr. Person", chat, console.log);
        var cb = function(err, result) {
            console.log("callback");
            if (err) {
                console.error(err);
            }
            console.log("result: " + result);
        };
        console.log("Added user " + newuser + " to chat " + chat);
        this.addMessage("Hi!", user, chat);
        console.log("this.checkUser(" + user + ", " + chat + "): " + this.checkUser(user, chat, cb));
        console.log("this.verifyUser(" + 0 + ', "Mr. Server", ' + chat + "): " + this.verifyUser(0, "Mr. Server", chat, cb));
        console.log("this.verifyUser(" + 0 + ', "Server", ' + chat + "): " + this.verifyUser(0, "Server", chat, cb));
        this.getAllUsers(chat, console.log);
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
            chatID = DBManager.sRandomBigValue(6);
            globalDB.run("INSERT INTO GlobalChats (chatID, chatName) VALUES(?, ?);", [chatID, chatName], err => {
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
                    "CREATE TABLE Users(userID         INT     UNIQUE  NOT NULL, userName             TEXT            NOT NULL, online           INT             NOT NULL, lastOnline       INT             NOT NULL);",
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
                    "CREATE TABLE Messages(     userID         INT     UNIQUE  NOT NULL,       message  TEXT,       time     INT            NOT NULL);",
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
        globalDB.run("INSERT INTO GlobalChats (chatID, chatName) VALUES(?, ?);", [chatID, chatName], err => {
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
                    "CREATE TABLE Users(userID         INT     UNIQUE  NOT NULL, userName             TEXT            NOT NULL, online           INT             NOT NULL, lastOnline       INT             NOT NULL);",
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
                    "CREATE TABLE Messages(     userID         INT     UNIQUE  NOT NULL,       message  TEXT,       time     INT            NOT NULL);",
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
            userID = DBManager.sRandomBigValue(6);
            globalDB.run("INSERT INTO GlobalUsers (userID) VALUES(?);", [userID], err => {
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
        globalDB.run("INSERT INTO GlobalUsers (userID) VALUES(?);", [userID], err => {
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

    addUser(userID, userName, chatID, callback) {
        if (chatDBs[chatID] == undefined) {
            //console.error("Error: Chat " + chatID + " does not exist");
            success = false;
            return callback(err, false);
        } else {
            this.checkUser(userID, chatID, function(err, status) {
                if (status == true) {
                    chatDBs[chatID].get("SELECT * FROM Users WHERE userID = (?)", [userID], (err, row) => {
                        if (err) {
                            return callback(err, false);
                        }
                        return row
                            ? callback(Error("DBM_ERROR: User " + userID + " is already a member of chat " + chatID))
                            : chatDBs[chatID].run("INSERT INTO Users    VALUES((?), (?), 1, (?));", [userID, userName, Date.now()], err => {
                                  if (err) {
                                      return callback(err, false);
                                  } else {
                                      globalDB.get("SELECT * FROM GlobalChats WHERE chatID == (?)", [chatID], function(err, row) {
                                          if (err) {
                                              return callback(err, false);
                                          }
                                          return callback(null, row.chatName);
                                      });
                                  }
                              });
                    });
                }
            });
        }
    }

    checkUser(userID, chatID, callback) {
        if (chatDBs[chatID] == undefined) {
            console.error("Error: Chat " + chatID + " does not exist");
            return callback(Error("DBM_ERROR: Chat " + chatID + " does not exist"), false);
        } else {
            globalDB.get("SELECT * FROM GlobalUsers WHERE userID = (?)", [userID], (err, row) => {
                if (err) {
                    console.error(err.message);
                    return callback(err, false);
                }
                return row
                    ? chatDBs[chatID].get("SELECT * FROM Users WHERE userID = (?)", [userID], (err, row) => {
                          if (err) {
                              console.error(err.message);
                              return callback(err, false);
                          }
                          return row
                              ? callback(null, row.userName)
                              : callback(Error("DBM_ERROR: User  " + userID + " does not exist in chat " + chatID), false);
                      })
                    : callback(Error("DBM_ERROR: User " + userID + " does not exist"), false);
            });
        }
    }

    verifyUser(userID, userName, chatID, callback) {
        if (chatDBs[chatID] == undefined) {
            console.error("Error: Chat " + chatID + " does not exist");
            return callback(Error("DBM_ERROR: Chat " + chatID + " does not exist"), false);
        } else {
            globalDB.get("SELECT * FROM GlobalUsers WHERE userID = (?)", [userID], (err, row) => {
                if (err) {
                    console.error(err.message);
                    return callback(err, false);
                }
                return row
                    ? chatDBs[chatID].get("SELECT * FROM Users WHERE userID = (?)", [userID], (err, row) => {
                          if (err) {
                              console.error(err.message);
                              return callback(err, false);
                          }
                          return row
                              ? callback(null, row.userName == userName)
                              : callback(Error("DBM_ERROR: User  " + userID + " does not exist in chat " + chatID), false);
                      })
                    : callback(Error("DBM_ERROR: User " + userID + " does not exist"), false);
            });
        }
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

        this.checkUser(userID, chatID, function(err, result) {
            if (result == true) {
                chatDBs[chatID].run("INSERT INTO Messages (userID, message, time) VALUES ((?), (?), (?));", [userID, message, Date.now()], err => {
                    if (err) {
                        console.error(err.message);
                        success = false;
                        return false;
                    }
                });
            } else {
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

    static sRandomBigValue(len) {
        return crypto
            .randomBytes(Math.ceil((len * 3) / 4))
            .toString("base64") // convert to base64 format
            .slice(0, len); // return required number of characters
    }
}

module.exports = DBManager;

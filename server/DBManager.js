/** Interface to the database which manages chats and users */
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");

var globalDB;
var chatDBs = {};

class DBManager {
    initDatabase(callback) {
        let firstBoot = true;

        if (fs.existsSync("./db/global.db")) {
            firstBoot = false;
        }

        globalDB = new sqlite3.Database("./db/global.db", err => {
            if (err) {
                return callback(err, null);
            } else {
                console.log("Connected to global database.");
                if (firstBoot == true) {
                    globalDB.run("CREATE TABLE GlobalUsers (userID INT PRIMARY KEY NOT NULL);", err => {
                        if (err) {
                            return callback(err, false);
                        } else {
                            globalDB.serialize();
                            globalDB.run("CREATE TABLE GlobalChats (chatID INT PRIMARY KEY NOT NULL, chatName TEXT NOT NULL);", err => {
                                if (err) {
                                    return callback(err, false);
                                } else {
                                    globalDB.run("INSERT INTO GlobalUsers (userID) VALUES(0);", err => {
                                        if (err) {
                                            return callback(err, false);
                                        } else {
                                            /*let dbm = this;
                                            this.createUser(function(err, user) {
                                                if (err) {
                                                    return callback(err, false);
                                                } else {
                                                    console.log("Created user " + user);
                                                    dbm.createChat("potato", function(err, chat) {
                                                        if (err) {
                                                            return callback(err, false);
                                                        } else {
                                                            console.log("Created chat " + chat);
                                                            if (err) {
                                                                return callback(err, false);
                                                            } else {
                                                                dbm.addUser(user, "Mr. Person", chat, function(err, chatName) {
                                                                    if (err) {
                                                                        return callback(err, false);
                                                                    } else {
                                                                        console.log("Added user " + user + ' to chat "' + chatName + '"');
                                                                        dbm.addMessage("Hi!", user, chat, Date.now(), function(err, status) {
                                                                            if (err) {
                                                                                return callback(err, false);
                                                                            } else {
                                                                                console.log('Added message "Hi!" to chat ' + chat);
                                                                                dbm.checkUser(user, chat, function(err, status) {
                                                                                    if (err) {
                                                                                        return callback(err, false);
                                                                                    } else {
                                                                                        console.log("this.checkUser(" + user + ", " + chat + "): " + status);
                                                                                        dbm.verifyUser(0, "Mr. Server", chat, function(err, status) {
                                                                                            if (err) {
                                                                                                return callback(err, false);
                                                                                            } else {
                                                                                                if (status == true) {
                                                                                                    return callback(
                                                                                                        Error(
                                                                                                            "Test failed: this.verifyUser(" +
                                                                                                                0 +
                                                                                                                ', "Mr. Server", ' +
                                                                                                                chat +
                                                                                                                "): " +
                                                                                                                status
                                                                                                        ),
                                                                                                        false
                                                                                                    );
                                                                                                } else {
                                                                                                    console.log(
                                                                                                        "this.verifyUser(" +
                                                                                                            0 +
                                                                                                            ', "Mr. Server", ' +
                                                                                                            chat +
                                                                                                            "): " +
                                                                                                            status
                                                                                                    );
                                                                                                    dbm.verifyUser(0, "Server", chat, function(err, status) {
                                                                                                        if (err) {
                                                                                                            return callback(err, false);
                                                                                                        } else {
                                                                                                            if (status == false) {
                                                                                                                return callback(
                                                                                                                    Error(
                                                                                                                        "Test failed: this.verifyUser(" +
                                                                                                                            0 +
                                                                                                                            ', "Server", ' +
                                                                                                                            chat +
                                                                                                                            "): " +
                                                                                                                            status
                                                                                                                    ),
                                                                                                                    false
                                                                                                                );
                                                                                                            } else {
                                                                                                                console.log(
                                                                                                                    "this.verifyUser(" +
                                                                                                                        0 +
                                                                                                                        ', "Server", ' +
                                                                                                                        chat +
                                                                                                                        "): " +
                                                                                                                        status
                                                                                                                );
                                                                                                                dbm.getAllUsers(chat, console.log);
                                                                                                                dbm.getMessages(chat, console.log);
                                                                                                                return callback(null, true);
                                                                                                            }
                                                                                                        }
                                                                                                    });
                                                                                                }
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                });
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    });
                                                }
                                            });*/
                                            // Test code ends here
                                            return callback(null, true);
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    // Reload old stored chats here.
                }
            }
        });
        globalDB.serialize();
    }

    deinitDatabase() {
        // SLQ queries to deinitialize global database
        // return: true if deinitialized successfully, otherwise false
        // low priority
    }

    createChat(chatName, callback) {
        var maxTries = 16;
        this.createChatInner(
            function(err, chatID) {
                if (err) {
                    return callback(err, false);
                } else {
                    let newChatDB = new sqlite3.Database("./db/" + chatID + ".db", err => {
                        if (err) {
                            return callback(err, false);
                        }
                    });
                    chatDBs[chatID] = newChatDB;
                    console.log("Created database for chat " + chatID + ".");
                    newChatDB.serialize();
                    newChatDB.run(
                        "CREATE TABLE Users(userID INT UNIQUE NOT NULL, username TEXT NOT NULL, online INT NOT NULL, lastOnline INT NOT NULL);",
                        err => {
                            if (err) {
                                return callback(err, false);
                            } else {
                                newChatDB.run('INSERT INTO Users VALUES(0, "event", 1, (?));', [Date.now()], err => {
                                    if (err) {
                                        return callback(err, false);
                                    } else {
                                        newChatDB.run("CREATE TABLE Messages(userID INT NOT NULL, message TEXT, time INT NOT NULL);", err => {
                                            if (err) {
                                                return callback(err, false);
                                            } else {
                                                newChatDB.run(
                                                    "INSERT INTO Messages    VALUES(0, 'Chat \"" + chatName + "\" created.', (?));",
                                                    [Date.now()],
                                                    err => {
                                                        if (err) {
                                                            return callback(err, false);
                                                        } else {
                                                            return callback(null, chatID);
                                                        }
                                                    }
                                                );
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    );
                }
            },
            chatName,
            maxTries,
            0
        );
    }

    createChatInner(callback, chatName, maxTries, tries) {
        var chatID;
        if (tries < maxTries) {
            chatID = DBManager.sRandomBigValue(6);
            globalDB.run("INSERT INTO GlobalChats (chatID, chatName) VALUES(?, ?);", [chatID, chatName], err => {
                if (err) {
                    tries++;
                    //console.log("tries: " + tries);
                    console.error(err);
                    return this.createChatInner(callback, chatName, maxTries, tries);
                } else {
                    return callback(null, chatID);
                }
            });
        } else {
            return callback(Error("DBM_Error: Could not add new ID to GlobalUsers, maxTries (" + maxTries + ") exceeded"), false);
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
                .run("CREATE TABLE Users(userID INT UNIQUE NOT NULL, username TEXT NOT NULL, online INT NOT NULL, lastOnline INT NOT NULL);", err => {
                    if (err) {
                        console.error(err.message);
                        success = false;
                        return false;
                    }
                })
                .run('INSERT INTO Users VALUES(0, "Server", 1, (?));', [Date.now()], err => {
                    if (err) {
                        console.error(err.message);
                        success = false;
                        return false;
                    }
                })
                .run("CREATE TABLE Messages(userID INT NOT NULL, message TEXT, time INT NOT NULL);", err => {
                    if (err) {
                        console.error(err.message);
                        success = false;
                        return false;
                    }
                })
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

    createUser(callback) {
        var success = false;
        var maxTries = 16;
        return this.createUserInner(callback, maxTries, 0);
    }

    createUserInner(callback, maxTries, tries) {
        var userID;
        if (tries < maxTries) {
            userID = DBManager.sRandomBigValue(6);
            globalDB.run("INSERT INTO GlobalUsers (userID) VALUES(?);", [userID], err => {
                if (err) {
                    tries++;
                    //console.log("tries: " + tries);
                    console.error(err);
                    return this.createUserInner(callback, maxTries, tries);
                } else {
                    return callback(null, userID);
                }
            });
        } else {
            return callback(Error("DBM_Error: Could not add new ID to GlobalUsers, maxTries (" + maxTries + ") exceeded"), false);
        }
    }

    createUser_debug(userID, callback) {
        globalDB.run("INSERT INTO GlobalUsers (userID) VALUES(?);", [userID], err => {
            if (err) {
                return callback(err, false);
            } else {
                return callback(null, UserID);
            }
        });
    }

    deleteUser(userID) {
        // SQL query to delete global user `userID`
        // return: true if deleted successfully, otherwise false
        // low priority
    }

    addUser(userID, username, chatID, callback) {
        if (chatDBs[chatID] == undefined) {
            return callback(Error("DBM_ERROR: Chat " + chatID + " does not exist"), false);
        } else {
            globalDB.get("SELECT * FROM GlobalUsers WHERE userID = (?)", [userID], function(err, row) {
                if (err) {
                    return callback(err, null);
                } else if (row) {
                    chatDBs[chatID].get("SELECT * FROM Users WHERE userID = (?)", [userID], (err, row) => {
                        if (err) {
                            return callback(err, false);
                        }
                        return row
                            ? callback(Error("DBM_ERROR: User " + userID + " is already a member of chat " + chatID))
                            : chatDBs[chatID].run("INSERT INTO Users    VALUES((?), (?), 1, (?));", [userID, username, Date.now()], err => {
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
                } else {
                    return callback(Error("DBM_ERROR: User " + userID + " does not exist"), false);
                }
            });
        }
    }

    checkUser(userID, chatID, callback) {
        if (chatDBs[chatID] == undefined) {
            return callback(Error("DBM_ERROR: Chat " + chatID + " does not exist"), false);
        } else {
            globalDB.get("SELECT * FROM GlobalUsers WHERE userID = (?)", [userID], (err, row) => {
                if (err) {
                    return callback(err, false);
                }
                return row
                    ? chatDBs[chatID].get("SELECT * FROM Users WHERE userID = (?)", [userID], (err, row) => {
                          if (err) {
                              return callback(err, false);
                          }
                          return row
                              ? callback(null, row.username)
                              : callback(Error("DBM_ERROR: User  " + userID + " does not exist in chat " + chatID), false);
                      })
                    : callback(Error("DBM_ERROR: User " + userID + " does not exist"), false);
            });
        }
    }

    verifyUser(userID, username, chatID, callback) {
        if (chatDBs[chatID] == undefined) {
            return callback(Error("DBM_ERROR: Chat " + chatID + " does not exist"), false);
        } else {
            globalDB.get("SELECT * FROM GlobalUsers WHERE userID = (?)", [userID], (err, row) => {
                if (err) {
                    return callback(err, false);
                }
                return row
                    ? chatDBs[chatID].get("SELECT * FROM Users WHERE userID = (?)", [userID], (err, row) => {
                          if (err) {
                              return callback(err, false);
                          }
                          return row
                              ? callback(null, row.username == username)
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

    addMessage(message, userID, chatID, time, callback) {
        if (chatDBs[chatID] == undefined) {
            return callback(Error("DBM_ERROR: Chat " + chatID + " does not exist"));
        } else {
            this.checkUser(userID, chatID, function(err, result) {
                if (err) {
                    return callback(err);
                } /*if (result == true)*/ else {
                    chatDBs[chatID].run("INSERT INTO Messages (userID, message, time) VALUES ((?), (?), (?));", [userID, message, time], err => {
                        if (err) {
                            return callback(err);
                        }
                        return callback(null);
                    });
                }
            });
        }
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
            .slice(0, len) // return required number of characters
            .replace(/\//g, "-"); // replace '/' with '-', more FS friendly, should fix occasional "CANTOPEN".
    }
}

module.exports = DBManager;

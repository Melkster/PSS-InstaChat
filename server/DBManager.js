/** Interface to the database which manages chats and users */
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");
const DBMTests = require("./DBMTests.js");

var globalDB;
var chatDBs = {};

class DBManager {
    /* initDatabase:
     * Initializes global database, creating global.db if it doesn't exist, reloading existing
     * chat DBs otherwise (WIP).
     * return: callback(null, true) if deleted successfully, callback(err, false) otherwise.
     */

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
                                            //return DBMTests.test(this, chatDBs, callback); // TODO: Figrue out how to make chatDBs and globalDB instance variables because they probably should be.
                                            return callback(null, true);
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    globalDB.all("SELECT * FROM GlobalChats", function(err, rows) {
                        if (err) {
                            return callback(err, false);
                        } else {
                            rows.forEach(row => {
                                let newChatDB = new sqlite3.Database("./db/" + row.chatID + ".db", err => {
                                    if (err) {
                                        return callback(err, false);
                                    } else {
                                        //console.log("Successfully reloaded database for chat " + row.chatID + ".");
                                        chatDBs[row.chatID] = newChatDB;
                                    }
                                });
                            });
                            return callback(null, true);
                        }
                    });
                }
            }
        });
        globalDB.serialize();
    }

    /* deinitDatabase:
     * Deinitializes global database.
     * return:
     */
    deinitDatabase() {
        // TODO: low priority
    }

    /* createChat:
     * Creates a new chat.
     * return: callback(null, chatID) if created successfully, callback(err, false) otherwise.
     * TODO: Improve this.
     */
    createChat(chatName, callback) {
        var createChatInner = function(callback, chatName, maxTries, tries) {
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
        };

        var maxTries = 16;
        createChatInner(
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
                                newChatDB.run('INSERT INTO Users VALUES(0, "Server", 1, (?));', [Date.now()], err => {
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

    /* createChat_debug:
     * Creates a new chat with a given chatID.
     * TODO: Delete this.
     */
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

    /* deleteChat:
     * Deletes chat with `chatID`
     * return: callback(null, true) if deleted successfully, otherwise callback(err, false).
     */
    deleteChat(chatID, callback) {
        if (chatDBs[chatID] == undefined) {
            return callback(Error("DBM_ERROR: Chat " + chatID + " does not exist"), false);
        } else {
            globalDB.run("DELETE FROM GlobalChats WHERE chatID = (?)", [chatID], (err, row) => {
                if (err) {
                    return callback(err, false);
                } else {
                    chatDBs[chatID].close();
                    chatDBs[chatID] = undefined;
                    fs.unlink("./db/" + chatID + ".db", callback);
                }
            });
        }
    }

    /* createUser:
     * Creates a new user.
     * return: callback(null, chatID) if created successfully, callback(err, false) otherwise.
     */
    createUser(callback) {
        var createUserInner = function(callback, maxTries, tries) {
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
        };
        var success = false;
        var maxTries = 16;
        return createUserInner(callback, maxTries, 0);
    }

    /* createUser_debug:
     * Creates a new user with a given userID.
     * TODO: Delete this.
     */
    createUser_debug(userID, callback) {
        globalDB.run("INSERT INTO GlobalUsers (userID) VALUES(?);", [userID], err => {
            if (err) {
                return callback(err, false);
            } else {
                return callback(null, UserID);
            }
        });
    }

    /* deleteUser:
     * Deletes the user with `userID` from the global DB.
     * return: callback(null, true) if deleted successfully, callback(err, false) otherwise.
     */
    deleteUser(userID) {
        // TODO: low priority
    }

    /* addUser:
     * Adds the user with `userID` to the chat with `chatID`.
     * return: callback(null, chatName) if added successfully, callback(err, false) otherwise.
     */
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

    /* checkUser:
     * Checks if the user with `userID` is in the chat with `chatID` and returns their name.
     * return: callback(null, username) if `userID` is in the chat with `chatID`,
     * callback(err, false) otherwise.
     */
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

    /* verifyUser:
     * Verifies that the user with `userID` is in the chat with `chatID` and that their name is
     * `username`.
     * return: callback(null, true) if `userID` is in the chat with `chatID` and their name is
     * `username`, callback(null, false) if their name is not `username`, callback(err, false)
     * otherwise.
     */
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
                          console.log("row.username = ", row.username);
                          return row
                              ? callback(null, row.username == username)
                              : callback(Error("DBM_ERROR: User  " + userID + " does not exist in chat " + chatID), false);
                      })
                    : callback(Error("DBM_ERROR: User " + userID + " does not exist"), false);
            });
        }
    }

    /* removeUser:
     * Removes user with `userID` from chat with `chatID`.
     * return: callback(null) if removed successfully, callback(err) otherwise.
     */
    removeUser(userID, chatID, callback) {
        if (chatDBs[chatID] == undefined) {
            return callback(Error("DBM_ERROR: Chat " + chatID + " does not exist"));
        } else {
            chatDBs[chatID].get("SELECT * FROM Users WHERE userID = (?)", [userID], (err, row) => {
                if (err) {
                    return callback(err);
                }
                return row
                    ? chatDBs[chatID].run("DELETE FROM Users WHERE userID = (?)", [userID], (err, row) => {
                          if (err) {
                              return callback(err);
                          } else {
                              return callback(null);
                          }
                      })
                    : callback(Error("DBM_ERROR: User  " + userID + " does not exist in chat " + chatID));
            });
        }
    }

    /* getAllUsers:
     * Get all users which are in chat with `chatID`.
     * return: callback(null, rows) if retrieved successfully, callback(err, false) otherwise.
     * TODO: Improve this.
     */
    getAllUsers(chatID, callback) {
        if (chatDBs[chatID] == undefined) {
            return callback(ERROR("DBM_ERROR: Chat " + chatID + " does not exist"), false);
        } else {
            chatDBs[chatID].all("SELECT * FROM Users", callback);
        }
    }

    /* addMessage:
     * Adds message with content `message` from user with `userID` to chat with `chatID` at
     * time `time`.
     * return: callback(null) if added successfully, callback(err) otherwise.
     */
    addMessage(message, userID, chatID, time, callback) {
        if (chatDBs[chatID] == undefined) {
            return callback(Error("DBM_ERROR: Chat " + chatID + " does not exist"));
        } else {
            this.checkUser(userID, chatID, function(err, result) {
                if (err) {
                    return callback(err);
                } else {
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

    /* getMessages:
     * Get all messages from chat with `chatID`.
     * return: callback(null, rows) if retrieved successfully, callback(err, false) otherwise.
     * TODO: Improve this.
     */
    getMessages(chatID, callback) {
        if (chatDBs[chatID] == undefined) {
            return callback(Error("DBM_ERROR: Chat " + chatID + " does not exist"), false);
        } else {
            chatDBs[chatID].all("SELECT * FROM Messages", callback);
        }
    }

    /* Utility functions below */

    /* sRandomBigValue:
     * Generates a random modified Base64 (modified for readability) string of length `len`.
     * return: string.
     */
    static sRandomBigValue(len) {
        return crypto
            .randomBytes(Math.ceil((len * 3) / 4))
            .toString("base64") // convert to base64 format
            .slice(0, len) // return required number of characters
            .replace(/\//g, "-") // replace '/' with '-', more FS friendly, should fix occasional "CANTOPEN".
            .replace(/I/g, "=") // replace a few letters with special characters to reduce
            .replace(/O/g, ".") // confusion between letters and numbers which look alike.
            .replace(/l/g, ","); // When in doubt, it's a number now.
    }
}

module.exports = DBManager;

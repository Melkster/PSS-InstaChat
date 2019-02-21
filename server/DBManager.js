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

    addUser(userID, userName, chatID, callback) {
        if (chatDBs[chatID] == undefined) {
            //console.error("Error: Chat " + chatID + " does not exist");
            success = false;
            return callback(err, false);
        } else {
            this.checkUser(userID, chatID, function(err, status) {
                if (status == true) {
                    chatDBs[chatID].get("SELECT * FROM Users WHERE USERHASH = (?)", [userID], (err, row) => {
                        if (err) {
                            return callback(err, false);
                        }
                        return row
                            ? callback(Error("DBM_ERROR: User " + userID + " is already a member of chat " + chatID))
                            : chatDBs[chatID].run("INSERT INTO Users    VALUES((?), (?), 1, (?));", [userID, userName, Date.now()], err => {
                                  if (err) {
                                      return callback(err, false);
                                  } else {
                                      globalDB.get("SELECT * FROM GlobalChats WHERE CHATHASH == (?)", [userID], function(err, row) {
                                          if (err) {
                                              return callback(err, false);
                                          }
                                          return callback(null, row.CHATNAME);
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
            globalDB.get("SELECT * FROM GlobalUsers WHERE USERHASH = (?)", [userID], function(err, row) {
                if (err) {
                    console.error(err.message);
                    return callback(err, false);
                }
                return row ? callback(null, true) : callback(Error("DBM_ERROR: User " + userID + " does not exist"), false);
            });
        }
    }

    verifyUser(userID, userName, chatID, callback) {
        if (chatDBs[chatID] == undefined) {
            console.error("Error: Chat " + chatID + " does not exist");
            return callback(Error("DBM_ERROR: Chat " + chatID + " does not exist"), false);
        } else {
            globalDB.get("SELECT * FROM GlobalUsers WHERE USERHASH = (?)", [userID], (err, row) => {
                if (err) {
                    console.error(err.message);
                    return callback(err, false);
                }
                return row
                    ? chatDBs[chatID].get("SELECT * FROM Users WHERE USERHASH = (?)", [userID], (err, row) => {
                          if (err) {
                              console.error(err.message);
                              return callback(err, false);
                          }
                          return row
                              ? callback(null, row.NAME == userName)
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
                chatDBs[chatID].run("INSERT INTO Messages (USERHASH, MESSAGE, TIME) VALUES ((?), (?), (?));", [userID, message, Date.now()], err => {
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

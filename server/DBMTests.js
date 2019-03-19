const DBManager = require("./DBManager.js");
const expect = require("chai").expect;

describe("Database manager tests", function() {
    describe("deleteChat", function() {
        const dbm = new DBManager();
        const callback = console.error;
        var userID;
        var chatID;
        before(function(done) {
            dbm.initDatabase(function(err, status) {
                expect(err).to.equal(null);
                expect(status).to.equal(true);
                dbm.createUser(function(err, user) {
                    if (err) {
                        return callback(err, false);
                    } else {
                        //console.log("Created user " + user);
                        dbm.createChat("potato", function(err, chat) {
                            //console.log("Created chat " + chat);
                            chatID = chat;
                            if (err) {
                                return callback(err, false);
                            } else {
                                dbm.addUser(user, "Mr. Person", chat, function(err, chatName) {
                                    if (err) {
                                        return callback(err, false);
                                    } else {
                                        //console.log("Added user " + user + ' to chat "' + chatName + '"');
                                        dbm.addMessage("Hi!", user, chat, Date.now(), function(err, status) {
                                            if (err) {
                                                return callback(err, false);
                                            } else {
                                                //console.log('Added message "Hi!" to chat ' + chat);
                                                dbm.checkUser(user, chat, function(err, status) {
                                                    if (err) {
                                                        return callback(err, false);
                                                    } else {
                                                        //console.log("this.checkUser(" + user + ", " + chat + "): " + status);
                                                        dbm.verifyUser(0, "Mr. Server", chat, function(err, status) {
                                                            if (err) {
                                                                return callback(err, false);
                                                            } else {
                                                                if (status == true) {
                                                                    return callback(
                                                                        Error("Test failed: this.verifyUser(" + 0 + ', "Mr. Server", ' + chat + "): " + status),
                                                                        false
                                                                    );
                                                                } else {
                                                                    //console.log("this.verifyUser(" + 0 + ', "Mr. Server", ' + chat + "): " + status);
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
                                                                                //console.log("this.verifyUser(" + 0 + ', "Server", ' + chat + "): " + status);
                                                                                //dbm.getAllUsers(chat, console.log);
                                                                                //dbm.getMessages(chat, console.log);
                                                                                dbm.removeUser(user, chat, function(err, status) {
                                                                                    if (err) {
                                                                                        return callback(err, false);
                                                                                    } else {
                                                                                        //dbm.getAllUsers(chat, console.log);
                                                                                        dbm.deleteChat(chat, function(err, status) {
                                                                                            if (err) {
                                                                                                return callback(err, false);
                                                                                            } else {
                                                                                                done();
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                });
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
                        });
                    }
                });
            });
        });
        it("The database manager should be able to delete a chat.", done => {
            dbm.deleteChat(chatID, function(err, status) {
                expect(status).to.equal(false);
                done();
            });
        });
    });
});

class DBMTests {
    /* test:
     * Runs tests.
     * return: callback(null, true) if tests run successfully, callback(err, false) otherwise.
     */
    static test(dbm, chatDBs, callback) {
        dbm.createUser(function(err, user) {
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
                                                                    Error("Test failed: this.verifyUser(" + 0 + ', "Mr. Server", ' + chat + "): " + status),
                                                                    false
                                                                );
                                                            } else {
                                                                console.log("this.verifyUser(" + 0 + ', "Mr. Server", ' + chat + "): " + status);
                                                                dbm.verifyUser(0, "Server", chat, function(err, status) {
                                                                    if (err) {
                                                                        return callback(err, false);
                                                                    } else {
                                                                        if (status == false) {
                                                                            return callback(
                                                                                Error(
                                                                                    "Test failed: this.verifyUser(" + 0 + ', "Server", ' + chat + "): " + status
                                                                                ),
                                                                                false
                                                                            );
                                                                        } else {
                                                                            console.log("this.verifyUser(" + 0 + ', "Server", ' + chat + "): " + status);
                                                                            dbm.getAllUsers(chat, console.log);
                                                                            dbm.getMessages(chat, console.log);
                                                                            dbm.removeUser(user, chat, function(err, status) {
                                                                                if (err) {
                                                                                    return callback(err, false);
                                                                                } else {
                                                                                    dbm.getAllUsers(chat, console.log);
                                                                                    dbm.deleteChat(chat, function(err, status) {
                                                                                        if (err) {
                                                                                            return callback(err, false);
                                                                                        } else {
                                                                                            if (chatDBs[chat] == undefined) {
                                                                                                return callback(null, true);
                                                                                            } else {
                                                                                                return callback(
                                                                                                    Error(
                                                                                                        "Test failed: this.deleteChat(" + chat + "): " + status
                                                                                                    ),
                                                                                                    false
                                                                                                );
                                                                                            }
                                                                                        }
                                                                                    });
                                                                                }
                                                                            });
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
        });
    }
}

module.exports = DBMTests;

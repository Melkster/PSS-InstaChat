const DBManager = require("./DBManager.js");
const expect = require("chai").expect;

describe("Database manager tests", function() {
    const callback = console.error;
    var userID;
    var chatID;
    describe("initDatabase", function() {
        const dbm = new DBManager();
        describe("First boot", function() {
            it("The database manager should be able to initialize the global database.", done => {
                dbm.initDatabase(false, function(err, status) {
                    expect(err).to.equal(null);
                    expect(status).to.equal(true);
                    done();
                });
            });
        });
        describe("Second boot", function() {
            before(function(done) {
                dbm.initDatabase(false, function(err, status) {
                    if (err) {
                        return callback(err, false);
                    } else {
                        dbm.createUser(function(err, user) {
                            if (err) {
                                return callback(err, false);
                            } else {
                                userID = user;
                                dbm.createChat("potato", function(err, chat) {
                                    if (err) {
                                        return callback(err, false);
                                    } else {
                                        chatID = chat;
                                        dbm.addUser(user, "Mr. Person", chat, function(err, chatName) {
                                            if (err) {
                                                return callback(err, false);
                                            } else {
                                                done();
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            });
            it("The database manager should be able to reload chats.", done => {
                dbm.initDatabase(false, function(err, status) {
                    expect(err).to.equal(null);
                    expect(status).to.equal(true);
                    dbm.getAllUsers(chatID, function(err, rows) {
                        expect(err).to.equal(null);
                        done();
                    });
                });
            });
            it("The database manager should be able to reload users.", done => {
                dbm.initDatabase(false, function(err, status) {
                    expect(err).to.equal(null);
                    expect(status).to.equal(true);
                    dbm.getAllUsers(chatID, function(err, rows) {
                        expect(err).to.equal(null);
                        expect(rows[0].userID).to.equal(0);
                        expect(rows[1].userID).to.equal(userID);
                        done();
                    });
                });
            });
        });
    });

    describe("deleteChat", function() {
        const dbm = new DBManager();
        before(function(done) {
            dbm.initDatabase(false, function(err, status) {
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

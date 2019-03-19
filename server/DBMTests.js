const DBManager = require("./DBManager.js");
const expect = require("chai").expect;

describe("Database manager tests", function() {
    const callback = function(err) {
        console.error(err);
        expect(err).to.equal(null);
    };
    var userID;
    var chatID;
    describe("Initialization tests", function() {
        const dbm = new DBManager();
        describe("initDatabase on first boot", function() {
            it("The database manager should be able to initialize the global database.", done => {
                dbm.initDatabase(false, function(err, status) {
                    expect(err).to.equal(null);
                    expect(status).to.equal(true);
                    done();
                });
            });
        });

        describe("initDatabase on second boot", function() {
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

    describe("Chat related tests", function() {
        const dbm = new DBManager();
        describe("createChat", function() {
            before(function(done) {
                dbm.initDatabase(false, function(err, status) {
                    if (err) {
                        return callback(err, false);
                    } else {
                        done();
                    }
                });
            });
            it("The database manager should be able to create a chat.", done => {
                dbm.createChat(chatID, function(err, chat) {
                    expect(err).to.equal(null);
                    done();
                });
            });
        });

        describe("deleteChat", function() {
            before(function(done) {
                dbm.initDatabase(false, function(err, status) {
                    if (err) {
                        return callback(err, false);
                    } else {
                        dbm.createUser(function(err, user) {
                            if (err) {
                                return callback(err, false);
                            } else {
                                dbm.createChat("potato", function(err, chat) {
                                    chatID = chat;
                                    if (err) {
                                        return callback(err, false);
                                    } else {
                                        dbm.addUser(user, "Mr. Person", chat, function(err, chatName) {
                                            if (err) {
                                                return callback(err, false);
                                            } else {
                                                dbm.addMessage("Hi!", user, chat, Date.now(), function(err, status) {
                                                    if (err) {
                                                        return callback(err, false);
                                                    } else {
                                                        dbm.checkUser(user, chat, function(err, status) {
                                                            if (err) {
                                                                return callback(err, false);
                                                            } else {
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
                                                                                        dbm.removeUser(user, chat, function(err, status) {
                                                                                            if (err) {
                                                                                                return callback(err, false);
                                                                                            } else {
                                                                                                done();
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
                    }
                });
            });
            it("The database manager should be able to delete a chat.", done => {
                dbm.deleteChat(chatID, function(err, status) {
                    expect(err).to.equal(null);
                    dbm.deleteChat(chatID, function(err, status) {
                        expect(status).to.equal(false);
                        done();
                    });
                });
            });
        });
    });
    describe("User related tests", function() {
        const dbm = new DBManager();
        describe("createUser", function() {
            before(function(done) {
                dbm.initDatabase(false, function(err, status) {
                    if (err) {
                        return callback(err, false);
                    } else {
                        done();
                    }
                });
            });
            it("The database manager should be able to create a user.", done => {
                dbm.createUser(function(err) {
                    expect(err).to.equal(null);
                    done();
                });
            });
        });

        describe("addUser", function() {
            before(function(done) {
                dbm.initDatabase(false, function(err, status) {
                    if (err) {
                        return callback(err, false);
                    } else {
                        dbm.createUser(function(err, user) {
                            userID = user;
                            if (err) {
                                return callback(err, false);
                            } else {
                                dbm.createChat("potato", function(err, chat) {
                                    chatID = chat;
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
            });
            it("The database manager should be able to add a user to a chat.", done => {
                dbm.addUser(userID, "Mr. Person", chatID, function(err, chatName) {
                    if (err) {
                        return callback(err, false);
                    } else {
                        done();
                    }
                });
            });
        });
        describe("checkUser", function() {
            before(function(done) {
                dbm.initDatabase(false, function(err, status) {
                    if (err) {
                        return callback(err, false);
                    } else {
                        dbm.createUser(function(err, user) {
                            userID = user;
                            if (err) {
                                return callback(err, false);
                            } else {
                                dbm.createChat("potato", function(err, chat) {
                                    chatID = chat;
                                    if (err) {
                                        return callback(err, false);
                                    } else {
                                        dbm.addUser(userID, "Mr. Person", chatID, function(err, chatName) {
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
            it("The database manager should be able to check if a user is in a chat.", done => {
                dbm.checkUser(userID, chatID, function(err, username) {
                    if (err) {
                        return callback(err, false);
                    } else {
                        expect(username).to.equal("Mr. Person");
                        done();
                    }
                });
            });
        });
        describe("verifyUser", function() {
            before(function(done) {
                dbm.initDatabase(false, function(err, status) {
                    if (err) {
                        return callback(err, false);
                    } else {
                        dbm.createChat("potato", function(err, chat) {
                            chatID = chat;
                            if (err) {
                                return callback(err, false);
                            } else {
                                done();
                            }
                        });
                    }
                });
            });
            it("The database manager should be able to verify that a user is in a chat.", done => {
                dbm.verifyUser(0, "Server", chatID, function(err, status) {
                    if (err) {
                        return callback(err, false);
                    } else {
                        expect(status).to.equal(true);
                        done();
                    }
                });
            });
            it("The database manager should be able to verify that a user is not lying about their username in a chat.", done => {
                dbm.verifyUser(0, "Mr. Server", chatID, function(err, status) {
                    if (err) {
                        return callback(err, false);
                    } else {
                        expect(status).to.equal(false);
                        done();
                    }
                });
            });
        });
        describe("removeUser", function() {
            before(function(done) {
                dbm.initDatabase(false, function(err, status) {
                    if (err) {
                        return callback(err, false);
                    } else {
                        dbm.createUser(function(err, user) {
                            userID = user;
                            if (err) {
                                return callback(err, false);
                            } else {
                                dbm.createChat("potato", function(err, chat) {
                                    chatID = chat;
                                    if (err) {
                                        return callback(err, false);
                                    } else {
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
            it("The database manager should be able to remove a user from a chat.", done => {
                dbm.removeUser(userID, chatID, function(err, status) {
                    if (err) {
                        return callback(err, false);
                    } else {
                        dbm.getAllUsers(chatID, function(err, rows) {
                            if (err) {
                                return callback(err, false);
                            } else {
                                expect(rows.length).to.equal(1);
                                done();
                            }
                        });
                    }
                });
            });
        });
        describe("getAllUsers", function() {
            before(function(done) {
                dbm.initDatabase(false, function(err, status) {
                    if (err) {
                        return callback(err, false);
                    } else {
                        dbm.createUser(function(err, user) {
                            userID = user;
                            if (err) {
                                return callback(err, false);
                            } else {
                                dbm.createChat("potato", function(err, chat) {
                                    chatID = chat;
                                    if (err) {
                                        return callback(err, false);
                                    } else {
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
            it("The database manager should be able to retreive all users from a chat.", done => {
                dbm.getAllUsers(chatID, function(err, rows) {
                    if (err) {
                        return callback(err, false);
                    } else {
                        expect(rows.length).to.equal(2);
                        expect(rows[0].userID).to.equal(0);
                        expect(rows[0].username).to.equal("Server");
                        expect(rows[1].userID).to.equal(userID);
                        expect(rows[1].username).to.equal("Mr. Person");
                        done();
                    }
                });
            });
        });
    });
    describe("Message related tests", function() {
        const dbm = new DBManager();
        describe("addMessage", function() {
            before(function(done) {
                dbm.initDatabase(false, function(err, status) {
                    if (err) {
                        return callback(err, false);
                    } else {
                        dbm.createUser(function(err, user) {
                            userID = user;
                            if (err) {
                                return callback(err, false);
                            } else {
                                dbm.createChat("potato", function(err, chat) {
                                    chatID = chat;
                                    if (err) {
                                        return callback(err, false);
                                    } else {
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
            it("The database manager should be able to add a message to a chat.", done => {
                dbm.addMessage("Hi!", userID, chatID, Date.now(), function(err, status) {
                    if (err) {
                        return callback(err, false);
                    } else {
                        done();
                    }
                });
            });
        });
        describe("getMessages", function() {
            before(function(done) {
                dbm.initDatabase(false, function(err, status) {
                    if (err) {
                        return callback(err, false);
                    } else {
                        dbm.createUser(function(err, user) {
                            userID = user;
                            if (err) {
                                return callback(err, false);
                            } else {
                                dbm.createChat("potato", function(err, chat) {
                                    chatID = chat;
                                    if (err) {
                                        return callback(err, false);
                                    } else {
                                        dbm.addUser(user, "Mr. Person", chat, function(err, chatName) {
                                            if (err) {
                                                return callback(err, false);
                                            } else {
                                                dbm.addMessage("Hi!", userID, chatID, Date.now(), function(err, status) {
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
                    }
                });
            });
            it("The database manager should be able to retreive all users from a chat.", done => {
                dbm.getMessages(chatID, function(err, rows) {
                    if (err) {
                        return callback(err, false);
                    } else {
                        expect(rows.length).to.equal(2);
                        expect(rows[0].userID).to.equal(0);
                        expect(rows[0].message).to.equal('Chat "potato" created.');
                        expect(rows[1].userID).to.equal(userID);
                        expect(rows[1].message).to.equal("Hi!");
                        done();
                    }
                });
            });
        });
    });
});

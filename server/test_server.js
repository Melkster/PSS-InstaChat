"use strict";

var expect = require("chai").expect;
var server = require("./server");
var io = require("socket.io-client");
var ioOptions = {
    transports: ["websocket"],
    forceNew: true,
    reconnection: false
};

var sender;
var receiver;
var USERID;
var CHATID;
var messageWrapper;

var testMessage = "This is a test message.";
var testMessage2 = "Here's a second test message.";
var testMessage3 = "What about a third test message?";
var USERNAME = "userName1";

describe("Server events test", () => {
    // connect two io clients
    sender = io("http://localhost:3000/", ioOptions);
    receiver = io("http://localhost:3000/", ioOptions);

    afterEach(done => {
        // remove all listeners after each test
        sender.removeListener();
        receiver.removeListener();
        done();
    });

    describe("Connecting with no user ID", () => {
        it("After calling 'identification' with no userID the sender should receive one", done => {
            sender.emit("identification", (null, null));
            sender.on("identification", userID => {
                expect(userID).to.not.equal(null);
                expect(userID).to.have.lengthOf(6);
                USERID = userID;
                done();
            });
        });
    });

    describe("Creating chats", () => {
        it("After calling 'createChat' the sender should receive the chatID of length 6 for that chat", done => {
            sender.emit("createChat", "ChatName1");
            sender.on("createChat", chatID => {
                expect(chatID).to.not.equal(null);
                expect(chatID).to.have.lengthOf(6);
                CHATID = chatID;
                done();
            });
        });
    });

    describe("Joining chats", () => {
        it("After a user requests to join a chat they should receive the chatID of that chat", done => {
            sender.emit("joinChat", USERID, USERNAME, CHATID);
            sender.on("joinChat", chatName => {
                expect(chatName).to.equal("ChatName1");
                done();
            });
        });
    });

    describe("Sending messages", function() {
        it("The sender should receive the message when the 'message' event is emited by the sender", done => {
            messageWrapper = {
                userID: USERID,
                username: USERNAME,
                chatID: CHATID,
                message: testMessage
            };
            sender.emit("message", JSON.stringify(messageWrapper));
            sender.on("message", msg => {
                expect(JSON.parse(msg).message).to.equal(messageWrapper.message);
                expect(JSON.parse(msg).username).to.equal(messageWrapper.username);
                expect(JSON.parse(msg).chatID).to.equal(messageWrapper.chatID);
                done();
            });
            sender.on("err", err => {
                console.log(err);
            });
        });
        it("The receiver should receive the message when the 'message' event is emited by the sender", done => {
            var receiverID;
            var messageWrapper2 = {
                userID: USERID,
                username: USERNAME,
                chatID: CHATID,
                message: testMessage2
            };
            receiver.emit("identification", (null, null));
            receiver.on("identification", userID => {
                receiverID = userID;
                receiver.emit("joinChat", receiverID, "userName2", CHATID);
            });
            receiver.on("message", msg => {
                expect(JSON.parse(msg).message).to.equal(messageWrapper2.message);
                expect(JSON.parse(msg).username).to.equal(messageWrapper2.username);
                expect(JSON.parse(msg).chatID).to.equal(messageWrapper2.chatID);
                done();
            });
            sender.on("err", err => {
                console.log(err);
            });
            receiver.on("err", err => {
                console.log(err);
            });
            sender.emit("message", JSON.stringify(messageWrapper2));
        });
    });

    describe("Fetching all previous messages in a chat", () => {
        it("After calling 'fetchMessages' all previous messages in the chat should sent", done => {
            var message1Count = 0;
            var message2Count = 0;
            var message3Count = 0;
            messageWrapper = {
                userID: USERID,
                username: USERNAME,
                chatID: CHATID,
                message: testMessage3
            };
            sender.emit("message", JSON.stringify(messageWrapper));

            receiver.on("message", messageWrapper => {
                messageWrapper = JSON.parse(messageWrapper);
                if (messageWrapper.message == testMessage) {
                    message1Count++;
                } else if (messageWrapper.message == testMessage2) {
                    message2Count++;
                } else if (messageWrapper.message == testMessage3) {
                    message3Count++;
                }
                if (message1Count == 1 && message2Count == 1 && message3Count == 1) done();
            });
            setTimeout(() => {
                receiver.emit("fetchMessages", CHATID);
            }, 50);
        });
    });
});

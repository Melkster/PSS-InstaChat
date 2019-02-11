/** Interface to the database which manages chats and users */
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

var globaldb;

class DBManager {

    initDatabase() {
        let firstboot = false;
        if (fs.existsSync("./db/global.db")) {
            firstboot = false;
        } else {
            firstboot = true;
        }

        globaldb = new sqlite3.Database('./db/global.db', (err) => {
            if (err) {
                console.error(err.message);
                return false;
            } else {
                console.log('Connected to global database.');
            }
        });
        
        if(firstboot == true) {
            globaldb.serialize(() => {
                globaldb.run('CREATE TABLE GlobalUsers(USERHASH INT     PRIMARY KEY      NOT NULL        );')      
                .run('CREATE TABLE GlobalChats(CHATHASH INT     PRIMARY KEY      NOT NULL);')
                .run('INSERT INTO GlobalUsers (USERHASH) VALUES(0);')});
        }

        return true;
    }

    deinitDatabase() {
        // SLQ queries to deinitialize global database
        // return: true if deinitialized successfully, otherwise false
        // low priority
    }
    
    createChat(chatName) {
        // SQL query to create chat with `chatName`
        // return: chatID if created successfully, otherwise false
        // TODO
    }

    removeChat(chatID) {
        // SQL query to remove chat with `chatID`
        // return: true if removed successfully, otherwise false
        // low priority
    }

    createUser() {
        var success = false;
        var userid;
        var tries = 0;
        while(success == false) {
            success = true;
            userid = DBManager.sRandomBigValue();
            globaldb.run('INSERT INTO GlobalUsers (USERHASH) VALUES(?);', [userid], (err) => {
                if(err) {
                    success = false;
                    if(tries > 16) {
                        return false;
                    }
                    tries++;
                } 
            });
        }
        return userid;
        //    globaldb.run('INSERT INTO GlobalUsers (USERHASH) VALUES(?);', [userhash]);
    }

    deleteUser(userID) {
        // SQL query to delete global user `userID`
        // return: true if deleted successfully, otherwise false
        // low priority
    }

    addUser(userID, userName, chatID) {
        // SQL query to create user with `userName` to chat with `chatID`
        // return: true if user was added successfully, otherwise false
        // TODO
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
        // Adds `messages` from user `userID` to chat with `chatID`
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
        var stringarray = [];
        for (var i = 0; i < array.length; i++) { 
            stringarray.push(DBManager.U8ToHexString(array[i]));
        }
        return stringarray.join("");
    }

    static U8ToHexString(byte) {
        var string = "";
        var hinybble = byte >> 4;
        var lonybble = byte - (hinybble << 4);
        string = hinybble.toString(16);
        return string.concat(lonybble.toString(16));
    }
}

module.exports = DBManager;

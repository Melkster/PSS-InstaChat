/** Interface to the database which manages chats and users */
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

class DBManager {

    initDatabase() {
        
    }

    deinitDatabase() {
        // SLQ queries to deinitialize global database
        // return: true if deinitialized successfully, otherwise false
        // TODO
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
        // SQL query to create global user
        // return: userID if user was added successfully, otherwise false
        // TODO
    }

    deleteUser(userID) {
        // SQL query to delete global user `userID`
    }

    addUser(userID, userName, chatID) {
        // SQL query to create user with `userName` to chat with `chatID`
        // return: true if user was added successfully, otherwise false
        // TODO
    }
    
    removeUser(userID, chatID) {
        // SQL query to remove user with `userID` from chat with `chatID`
        // @return: true if user was removed successfully, otherwise false
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
}

module.exports = DBManager;

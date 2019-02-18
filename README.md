# InstaChat
The effortless chat app.

## Usage

### Client
*\*TODO\**

### Server
To set everything up, run `npm install`

To start the server, run `npm start`.

## Dependencies
- [node.js](https://nodejs.org/)

## File information

### Client
- [App.js](./client/App.js) is the main chatroom body including `textInput`.
- [ChatItem.js](./client/ChatItem.js) is the text bubble.
- [MessagesList.js](./client/MessagesList.js) is an array for storing all the messages.

### Server
- [server.js](./server/server.js) is the main server file.
- [DBManager](./server/DBManager.js) creates an interface from the server file to its SQLite3 database.

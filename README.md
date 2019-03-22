# InstaChat <img src="./client/assets/icon.png" width="100px" align="right">
The effortless chat app.

## Usage
All commands should all be executed in this project's root directory.

To set everything up, run `make install`. Also, when running the client make
sure that the socket IP in [socket.js](client/socket.js) is set to the server's
IP adress (this currently has to be done manually).

### Client
To start the client, run `make run_client`. You will need an Expo app running
on a phone, with which you scan the QR code that shows up in order to run the
app on it'.

### Server
To start the server, run `make run_server`.

## Dependencies
- [node.js](https://nodejs.org/)
- [Expo](https://expo.io/)

## Development
To run all tests, run `make test`.

### File information

#### Client
- [App.js](./client/App.js) is the main chatroom body including `textInput`.
- [ChatItem.js](./client/ChatItem.js) is the text bubble.
- [MessagesList.js](./client/MessagesList.js) is an array for storing all the messages.

#### Server
- [server.js](./server/server.js) is the main server file.
- [DBManager](./server/DBManager.js) creates an interface from the server file to its SQLite3 database.

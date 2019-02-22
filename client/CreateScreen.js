import React from "react";
import {
    Keyboard, TouchableHighlight, View,
    Text, TextInput, FlatList, KeyboardAvoidingView, Picker
} from "react-native";
import styles from './styles';
import chatRoomsList from './ChatRoomsList';
import socket from './socket';
//import console = require("console");
//import console = require("console");

class CreateScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chatRoomName: '',
            chatID: 'TEST0001', // This should be the hashcode.
        }
    }

    onSubmitButtonPressed() {
        const { navigation } = this.props;
        const state = navigation.getParam('currentState', 'unknown');

        // Here we need to update the current state.chats (not ChatRoomsList?)
        // and also update AsyncStorage so that the newly added chatroom is permanently stored
        // Communication is required with the server, the server expects the chatroom name
        // and returns a chatID.

        if (this.state.chatRoomName.length != 0) {
            socket.emit("createChat", this.state.chatRoomName);

            socket.on("createChat", chatID => {
                this.state.chatID = chatID;
                console.log(`Created chat with id '${chatID}'`);
            });

            const chatRoom = {
                name: this.state.chatRoomName,
                ChatID: this.state.chatID,
            }
            chatRoomsList.push(chatRoom);
            this.setState((prevState) => {
                return {chatRoomName: ''};
            });
            this.textInput.clear();
            Keyboard.dismiss();
            this.props.navigation.navigate('Chatroom', {
                name: state.name,
                chatId: this.state.chatID,
                chatName: this.state.chatRoomName,
            })

            // Sends a request to the server to create a chat with the namn this.state.chatRoomName
            socket.emit('createChat', this.state.chatRoomName);
            
            // Receives the chatID from the server
            socket.on('createChat', chatID => {
                // TODO: Create the new chat with the received chatID
            });
        } else {
            Keyboard.dismiss();
        }
    }

    render() {
        return (
            <View style={styles.createScreenView}>
                <TextInput
                    style={styles.chatRoomName}
                    placeholder="Enter Chatroom Name"
                    onChangeText={(text) => this.setState({chatRoomName: text})}
                    ref={input => {this.textInput = input;}}
                />

                <TouchableHighlight
                    style={styles.chatRoomNameSubmit}
                    onPress={this.onSubmitButtonPressed.bind(this)}
                >
                    <Text style={{color: 'white'}}>Submit</Text>
                </TouchableHighlight>
            </View>
        );
    }
}
export default CreateScreen;

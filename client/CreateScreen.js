import React from "react";
import {
    AsyncStorage, Keyboard, TouchableHighlight, View,
    Text, TextInput, FlatList, KeyboardAvoidingView, Picker
} from "react-native";
import styles from './styles';
import chatRoomsList from './ChatRoomsList';
import socket from './socket';

class CreateScreen extends React.Component {
    constructor(props) {
        super(props);
    }

    onSubmitButtonPressed(chatRoomName, state) {

        // Here we need to update the current state.chats (not ChatRoomsList?)
        // and also update AsyncStorage so that the newly added chatroom is permanently stored
        // Communication is required with the server, the server expects the chatroom name
        // and returns a chatID.
        if (chatRoomName.length != 0) {
            // Sends a request to the server to create a chat with the namn this.state.chatRoomName
            socket.emit("createChat", chatRoomName);

            // Receives the chatID from the server
            socket.on("createChat", chatID => {
                console.log(`Received chatID: '${chatID}'`);
                const chatRoom = {
                    name: chatRoomName,
                    chatID: chatID
                };
                state.chats.push(chatRoom);
                // Store the new chatroom in permanent memory
                AsyncStorage.setItem('chats', JSON.stringify(state.chats));
                this.props.navigation.navigate('Chatroom', {
                    currentState: state,
                    chatID: chatID,
                    chatName: chatRoomName
                })
            });
        }
    }

    render() {
        const { navigation } = this.props;
        const state = navigation.getParam('currentState', 'unknown');
        let chatRoomName = '';
        return (
            <View style={styles.createScreenView}>
                <TextInput
                    style={styles.chatRoomName}
                    placeholder="Enter Chatroom Name"
                    onChangeText={(value) =>  { chatRoomName = value }}
                />

                <TouchableHighlight
                    style={styles.chatRoomNameSubmit}
                    onPress={() => this.onSubmitButtonPressed(chatRoomName, state)}
                >
                    <Text style={{color: 'white'}}>Submit</Text>
                </TouchableHighlight>
            </View>
        );
    }
}
export default CreateScreen;

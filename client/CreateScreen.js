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
        this.state = {
            chatRoomName: '',
            currentState: this.props.navigation.getParam('currentState', 'unknown'),
        }
    }

    onSubmitButtonPressed() {

        // Here we need to update the current state.chats (not ChatRoomsList?)
        // and also update AsyncStorage so that the newly added chatroom is permanently stored
        // Communication is required with the server, the server expects the chatroom name
        // and returns a chatID.
        if (this.state.chatRoomName.length != 0) {
            console.log('submit pressed:' + this.state.chatRoomName);
            // Sends a request to the server to create a chat with the namn this.state.chatRoomName
            socket.emit("createChat", this.state.chatRoomName);

            // Receives the chatID from the server
            socket.once("createChat", chatID => {
                console.log(`Received chatID: '${chatID}'`);
                var chatRoom = {
                    name: this.state.chatRoomName,
                    chatID: chatID
                };
                this.state.currentState.chats.push(chatRoom);
                AsyncStorage.setItem('chats', JSON.stringify(this.state.currentState.chats));
                this.props.navigation.navigate('Chatroom', {
                    currentState: this.state.currentState,
                    chatID: chatID, // from server
                    chatName: this.state.chatRoomName
                })
            });
        }
    }

    setName = (value) => {
        console.log('changing state');
        this.setState({'chatRoomName': value});
        console.log('to: '+this.state.chatRoomName);
    };

    printChats = (chats) => {
        var s = '';
        for(var i = 0; i < chats.length; i++) {
            s = s + chats[i].name + '(' + chats[i].chatID + ')' + "\n";
        }
        return s;

    };

    render() {
        return (
            <View style={styles.createScreenView}>
                <Text>
                    Current chats: { '\n' + this.printChats(this.state.currentState.chats) }
                </Text>
                <TextInput
                    style={styles.chatRoomName}
                    placeholder="Enter Chatroom Name"
                    onChangeText={this.setName}
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

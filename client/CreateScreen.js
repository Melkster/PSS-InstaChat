import React from "react";
import {
    AsyncStorage, Keyboard, TouchableHighlight, View,
    Text, TextInput, FlatList, KeyboardAvoidingView, Platform
} from "react-native";
import styles from './styles';
import socket from './socket';

class CreateScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chatRoomName: '',
            nickname: '',
            currentState: this.props.navigation.getParam('currentState', 'unknown'),
        };

        socket.on("createChat", this.handleCreateChat);
    }

    componentWillUnmount() {
        socket.removeListener("createChat");
    }

    handleCreateChat = (chatID) => {
        var chatRoom = {
            name: this.state.chatRoomName.trim(),
            nickname: this.state.nickname.trim(),
            chatID: chatID
        };
        this.state.currentState.chats.push(chatRoom);
        AsyncStorage.setItem('chats', JSON.stringify(this.state.currentState.chats));

        // also need to join the newly created chat, this a good place to do it?
        console.log(`Joining ${chatID} as ${this.state.nickname}`);
        socket.emit("joinChat", this.state.currentState.userID, chatRoom.nickname, chatID);

        this.props.navigation.navigate('Chatroom', {
            currentState: this.state.currentState,
            chatID: chatID, // from server
            chatName: chatRoom.name,
            nickname: chatRoom.nickname
        })

    };

    onSubmitButtonPressed() {
        // `trim()` removes leading and trailing whitespace
        chatRoomName = this.state.chatRoomName.trim();
        nickname = this.state.nickname.trim();
        if (chatRoomName.length > 0 && nickname.length > 0) {
            socket.emit("createChat", chatRoomName);
        }
    }

    setChatName = (value) => {
        this.setState({'chatRoomName': value});
    };

    setNick = (value) => {
        this.setState({'nickname': value});
    };

    render() {
        return (

            <KeyboardAvoidingView style={styles.createScreenView}
                                  behavior={Platform.OS === "ios" ? "padding" : null}
                                  keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}>
                <TextInput
                    style={styles.chatRoomName2}
                    placeholder="Enter chatroom name"
                    onChangeText={this.setChatName}
                />
                <TextInput
                    style={styles.chatRoomName2}
                    placeholder="Enter desired nickname"
                    onChangeText={this.setNick}
                />
                <TouchableHighlight
                    style={styles.chatRoomNameSubmit}
                    onPress={this.onSubmitButtonPressed.bind(this)}
                >
                    <Text style={{color: 'white'}}>Submit</Text>
                </TouchableHighlight>
            </KeyboardAvoidingView>
        );
    }
}
export default CreateScreen;

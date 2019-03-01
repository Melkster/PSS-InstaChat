import React from "react";
import {
    Alert, View, Text, TextInput, TouchableHighlight,
} from "react-native";
import styles from './styles';

class JoinScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentState: this.props.navigation.getParam('currentState', 'unknown'),
            chatID: '',
            nickname: '',
        };
        socket.on("joinChat", this.handleJoinChat);
    }

    handleCreateChat = (name) => {
        this.props.navigation.navigate('Chatroom', {
            currentState: this.state.currentState,
            chatID: this.state.chatID,
            chatName: name,
            nickname: this.state.nickname
        })
    };

    onJoinButtonPressed() {
        var chatRoom = {
            name: this.state.chatRoomName,
            chatID: chatID,
            nickname: this.state.nickname,
        };
        chatRoom = JSON.parse(AsyncStorage.getItem('chats'));
        let userID = this.state.currentState.userID;
        let username = chatRoom.nickname;
        let chatID = chatRoom.userID;
        this.setState((prevState) => {
            return {chatID: chatID, nickname: username,};
        });
        socket.emit("joinChat", userID, username, chatID);
    }

    render() {
        return (
            <View style={styles.createScreenView}>
                <TextInput
                    style={styles.chatRoomName}
                    placeholder="Enter Chatroom Name"
                />
                <TouchableHighlight
                    style={styles.chatRoomNameSubmit}
                    onPress={this.onJoinButtonPressed.bind(this)}
                >
                    <Text style={{color: 'white'}}>Join</Text>
                </TouchableHighlight>
            </View>
        );
    }
}

export default JoinScreen;
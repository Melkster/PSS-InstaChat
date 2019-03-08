import React from "react";
import {
    AsyncStorage, View, Text, TextInput, TouchableHighlight,
} from "react-native";
import styles from './styles';
import socket from './socket';

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

    handleJoinChat = (name) => {
        console.log(`Received ChatRoom Name: '${name}'`);

        /* The chatroom needs to be stored into memory */
        var chatRoom = {
            name: name,
            chatID: this.state.chatID,
            nickname: this.state.nickname
        };
        /* And into current state object */
        this.state.currentState.chats.push(chatRoom);
        AsyncStorage.setItem('chats', JSON.stringify(this.state.currentState.chats));

        this.props.navigation.navigate('Chatroom', {
            currentState: this.state.currentState,
            chatID: this.state.chatID,
            chatName: name,
            nickname: this.state.nickname,
        })
    };

    onJoinButtonPressed() {
        if ( this.state.chatID.length != 0 && this.state.nickname.length != 0 ) {
            socket.emit("joinChat", this.state.currentState.userID, this.state.nickname, this.state.chatID);
            console.log('UserID: ' + this.state.currentState.userID + ' Nickname: ' + this.state.nickname + ' enter chatID:' + this.state.chatID);
        }
    }

    render() {
        return (
            <View style={styles.createScreenView}>
                <TextInput
                    style={styles.chatRoomName}
                    placeholder="Enter the Chatroom ID"
                    onChangeText={(text) => this.setState({chatID: text})}
                />
                <TextInput
                    style={styles.chatRoomName}
                    placeholder="Enter Your NickName in this ChatRoom"
                    onChangeText={(text) => this.setState({nickname: text})}
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
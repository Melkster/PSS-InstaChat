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
//        var chatRoom = {
//            name: '',
//            chatID: '',
//            nickname: '',
//        };
//        chatRoom = JSON.parse(AsyncStorage.getItem('chats'));
//        let userID = this.state.currentState.userID;
//        let username = chatRoom.nickname;
//        //let chatID = chatRoom.chatID;
//        this.setState((prevState) => {
//            return {nickname: username,};
//        });
        socket.emit("joinChat", this.state.currentState.userID, this.state.currentState.username, this.state.chatID);
    }

    render() {
        return (
            <View style={styles.createScreenView}>
                <TextInput
                    style={styles.chatRoomName}
                    placeholder="Enter Chatroom ID"
                    onChangeText={(text) => this.setState({chatID: text})}
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
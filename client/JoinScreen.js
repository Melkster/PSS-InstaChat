import React from "react";
import {
    AsyncStorage, View, Text, TextInput, TouchableHighlight, Dimensions
} from "react-native";
import { BarCodeScanner, Permissions } from 'expo';
import styles from './styles';
import socket from './socket';

class JoinScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasCameraPermission: null,
            currentState: this.props.navigation.getParam('currentState', 'unknown'),
            chatID: '',
            nickname: '',
        };
        socket.on("joinChat", this.handleJoinChat);
    }

    async componentDidMount() {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' });
    }

    handleJoinChat = (name) => {
        console.log(`Received ChatRoom Name: '${name}'`);

        /* The chatroom needs to be stored into memory */
        var chatRoom = {
            name: name.trim(),
            nickname: this.state.nickname.trim(),
            chatID: this.state.chatID
        };
        /* And into current state object */
        this.state.currentState.chats.push(chatRoom);
        AsyncStorage.setItem('chats', JSON.stringify(this.state.currentState.chats));

        this.props.navigation.navigate('Chatroom', {
            currentState: this.state.currentState,
            chatID: chatRoom.chatID,
            chatName: chatRoom.name,
            nickname: chatRoom.nickname,
        })
    };

    onJoinButtonPressed() {
        chatID = this.state.chatID;
        nickname = this.state.nickname.trim(); // `trim()` removes leading and trailing whitespace
        userID = this.state.currentState.userID;
        if (chatID.length > 0 && nickname.length > 0) {
            socket.emit("joinChat", userID, nickname, chatID);
            // console.log('UserID: ' + userID + ' Nickname: ' + nickname + ' enter chatID:' + chatID);
        }
    }

    _handleBarCodeRead = result => {
        console.log(result.data);
        if (result.data !== this.state.chatID) {
            this.setState({ chatID: result.data});
        }
    };

    render() {
        return (
            <View style={styles.createScreenView}>
                <TextInput
                    style={styles.chatRoomName2}
                    placeholder="Enter chatID"
                    value = {this.state.chatID}
                    onChangeText={(text) => this.setState({chatID: text})}
                />
                <TextInput
                    style={styles.chatRoomName2}
                    placeholder="Enter Your NickName in this ChatRoom"
                    onChangeText={(text) => this.setState({nickname: text})}
                />
                <TouchableHighlight
                    style={styles.chatRoomNameSubmit}
                    onPress={this.onJoinButtonPressed.bind(this)}
                >
                    <Text style={{color: 'white'}}>Join</Text>
                </TouchableHighlight>

                <View style={{
                    overflow: 'hidden',
                    width: Dimensions.get('window').width,
                    height: Dimensions.get('window').height/2
                }}>
                    <BarCodeScanner
                        onBarCodeRead={this._handleBarCodeRead.bind(this)}
                        style={{
                            flex:1
                        }}
                    />
                </View>

            </View>
        );
    }
}

export default JoinScreen;

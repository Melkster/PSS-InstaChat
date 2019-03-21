import React from "react";
import {
    AsyncStorage, View, Text, TextInput, TouchableHighlight, Modal, Platform, KeyboardAvoidingView
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
            modalVisible: false
        };
        socket.on("joinChat", this.handleJoinChat);
    }

    async componentDidMount() {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' });
    }

    componentWillUnmount() {
        socket.removeListener("joinChat");
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
        let chatID = this.state.chatID;
        let nickname = this.state.nickname.trim(); // `trim()` removes leading and trailing whitespace
        let userID = this.state.currentState.userID;
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
        this.setModalVisible(!this.state.modalVisible);
    };

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    tryAgain() {
        alert("hej");
    }

    render() {
        return (
            <KeyboardAvoidingView behavior={(Platform.OS === 'ios') ? 'padding' : null}
                                  keyboardVerticalOffset={Platform.select({ ios: 0, android: 500 })}
                                      style={styles.createScreenView}>
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

                <TouchableHighlight
                    style={{padding:10,
                        marginVertical: 10,
                        backgroundColor: 'black',
                    }}
                    onPress={() => {
                        this.setModalVisible(true);
                    }}>
                    <Text style={{
                        fontSize:20,
                        color: 'white'
                    }}>QR-code</Text>
                </TouchableHighlight>

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        this.setModalVisible(!this.state.modalVisible);
                    }}>
                    <View style={{
                        flex:1,
                        justifyContent: 'center'
                    }}>
                        {this.state.hasCameraPermission ?
                        <BarCodeScanner
                            onBarCodeRead={this._handleBarCodeRead.bind(this)}
                            style={{
                                flex:1
                            }}
                        /> : <Text>No access to camera</Text>}

                        <TouchableHighlight
                            onPress={() => {
                                this.setModalVisible(!this.state.modalVisible);
                            }}>
                            <Text style={{
                                fontSize:30,
                                color:'white',
                                textAlign: 'center',
                                textAlignVertical: 'bottom',
                                backgroundColor: 'black'
                            }}>Go back</Text>
                        </TouchableHighlight>
                    </View>
                </Modal>


            </KeyboardAvoidingView>
        );
    }
}

export default JoinScreen;

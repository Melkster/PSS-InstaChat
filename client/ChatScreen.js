import React from "react";
import {
    Modal, Keyboard, TouchableHighlight, View,
    Text, TextInput, FlatList, KeyboardAvoidingView, Dimensions

} from "react-native";
import QRCode from 'react-native-qrcode';
import styles from './styles';
import ChatItem from './ChatItem.js';
import socket from './socket';
import chatRoomsList from './ChatRoomsList';

class ChatScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newText: '',
            currentState: this.props.navigation.getParam('currentState', 'unknown'),
            chatID: this.props.navigation.getParam('chatID', 'unknown'),
            chatName: this.props.navigation.getParam('chatName', 'unknown'), // Make sure the drop-down list will select the right chatroom's name
            nickname: this.props.navigation.getParam('nickname', 'unknown'), // Make sure the drop-down list will select the right chatroom's name
            messages: [],
            modalVisible: false
        };

        socket.emit("fetchMessages", this.state.chatID);

        socket.on("message", messageWrapper => {
            console.log('Received '+ messageWrapper);
            this.state.messages.unshift(JSON.parse(messageWrapper));
            this.forceUpdate();
        });


    }

    componentWillUnmount() {
        socket.removeListener("message");
    }

    _onSendButtonPressed() {
        if (this.state.newText.length != 0) {
            const messageWrapper = {
                userID: this.state.currentState.userID,
                chatID: this.state.chatID,
                message: this.state.newText.trim() // `trim()` removes leading and trailing whitespace
            };
            this.textInput.clear();
            //Keyboard.dismiss();
            //this.refs.flatList.scrollToEnd(); // this actually scrolls to top because it's inverted /Maverick
            console.log('Sending ' + JSON.stringify(messageWrapper) + ' to server.');
            socket.emit("message", JSON.stringify(messageWrapper));
            this.state.newText = '';
        } else {
            Keyboard.dismiss();
        }
    }

    onPickerValueChange = (itemValue, itemIndex) => {
        this.setState(
            {
                pickerValue: itemValue,
                chatId: chatRoomsList[itemIndex].ChatID,
            },
        );
    }

    renderChatItem({item}) {
        return <ChatItem message={item} nickname={this.state.nickname}/>
    }

    keyExtractor = (item, index) => index.toString();

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    render() {
/*
*     welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
* */
        return (
            // maybe better fix than to hardcode 90
            <KeyboardAvoidingView style={styles.container} keyboardVerticalOffset={85} behavior="padding">

                <View style={{ flexDirection: 'row' ,justifyContent:'center'}}>
                    <Text style={{
                        padding:10,
                        fontSize:30,
                    }}>{this.state.chatName}</Text>
                    <TouchableHighlight
                        style={{padding:10,
                            backgroundColor: 'black',
                        }}
                        onPress={() => {
                            this.setModalVisible(true);
                        }}>
                        <Text style={{
                            fontSize:30,
                            color: 'white'
                        }}>Info</Text>
                    </TouchableHighlight>
                </View>


                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        Alert.alert('Modal has been closed.');
                    }}>
                    <View style={{
                        flex:1,
                        justifyContent: 'center'
                    }}>
                        <QRCode
                            value={this.state.chatID}
                            size={Dimensions.get('window').width}
                            bgColor='black'
                            fgColor='white'/>

                        <Text style={{fontSize:60, textAlign: 'center'}}>{this.state.chatID}</Text>

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



                <FlatList
                    style={{ flex: 1 }}
                    ref={"flatList"}
                    inverted
                    data={this.state.messages}
                    renderItem={this.renderChatItem.bind(this)}
                    keyExtractor={this.keyExtractor}
                    ListFooterComponent={this.renderFooter}
                />

                <View style={styles.messageBar}>
                    <TextInput style={styles.messageBox}
                               placeholder="Enter message"
                               ref={input => {
                                   this.textInput = input;
                               }}
                               onChangeText={(text) => this.setState({newText: text})}
                    />

                    <TouchableHighlight style={styles.sendButton}
                                        onPress={this._onSendButtonPressed.bind(this)}
                    >
                        <Text style={{color: 'white'}}>Send</Text>
                    </TouchableHighlight>
                </View>

            </KeyboardAvoidingView>

        );
    }
}


export default ChatScreen;

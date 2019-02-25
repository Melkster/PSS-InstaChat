import React from "react";
import {
    Keyboard, TouchableHighlight, View,
    Text, TextInput, FlatList, KeyboardAvoidingView, Picker
} from "react-native";
import styles from './styles';
import ChatItem from './ChatItem.js';
import messagesList from './MessagesList';
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
        }
    }

    _onSendButtonPressed() {
        console.log('Pressing submit');
        if (this.state.newText.length != 0) {
            const messageWrapper = {
                userID: this.state.currentState.userID,
                chatID: this.state.chatID,
                message: this.state.newText,
            };
            this.textInput.clear();
            Keyboard.dismiss();
            this.refs.flatList.scrollToEnd();
            console.log('Sending ' + JSON.stringify(messageWrapper) + ' to server.');
            socket.emit("message", JSON.stringify(messageWrapper));
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
        return <ChatItem message={item}/>
    }

    keyExtractor = (item, index) => index.toString();


    render() {
        let messages = [];

        socket.emit("fetchMessages", this.state.chatID);

        socket.on("message", data => {
            console.log('Received '+ data);
            messages.push(data);
        });

        socket.on("err", err => {
            console.log('Error: ' + err);
        });

        return (
            // maybe better fix than to hardcode 90
            <KeyboardAvoidingView style={styles.container} keyboardVerticalOffset={85} behavior="padding">

                <Text style={styles.welcome}>Welcome to {this.state.chatName} ({this.state.chatID}), {this.state.currentState.name}!</Text>

                <FlatList
                    ref={"flatList"}
                    inverted
                    data={messages}
                    renderItem={this.renderChatItem}
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

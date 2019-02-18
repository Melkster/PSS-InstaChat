import React from "react";
import {
    Keyboard, TouchableHighlight, View,
    Text, TextInput, FlatList, KeyboardAvoidingView
} from "react-native";
import styles from './styles';
import ChatItem from './ChatItem.js';
import messagesList from './MessagesList';
import socket from './socket';
// SHANGS CHATROOM
/*
message format:
{
    UserID: h7h7h7
    ChatID: ABC123
    message: 'hello'
}
 */
class ChatScreen extends React.Component {
    constructor() {
        super();
        this.state = {
            newText: '',
        }
    }

    

    // After user press the "Send" button, TextInput will be clear.
    // This is probably where we want to send the message 'newText' to the server later
    _onSendButtonPressed() {
        if (this.state.newText.length != 0) {
            const messageWrapper = {
                id: 2,
                text: this.state.newText,
                author: {
                    id: 2,
                    username: 'Shang',
                }
            };
            messagesList.reverse().push(messageWrapper);
            messagesList.reverse()
            this.setState((prevState) => {
                return {newText: ''};
            });
            this.textInput.clear();
            Keyboard.dismiss();
            this.refs.flatList.scrollToEnd();
            socket.emit('message', messageWrapper);
        } else {
            Keyboard.dismiss();
        }
    }

    renderChatItem({item}) {
        return <ChatItem message={item}/>
        //return <Text>{item.text}</Text>
    }
    keyExtractor = (item, index) => index.toString();


    render() {
        const { navigation } = this.props;
        const name = navigation.getParam('name', 'unknown');
        const chatId = navigation.getParam('chatId', 'unknown');
        
        socket.on("message", data => {
            // TODO: Recieves the message when another user sends it, needs to handle it 
            console.log(data);
        });

        return (
            // maybe better fix than to hardcode 90
            <KeyboardAvoidingView style={styles.container} keyboardVerticalOffset={90} behavior="padding">
                <Text style={styles.welcome}>Welcome to {chatId}, {name}!</Text>

                <FlatList
                    ref={"flatList"}
                    inverted
                    //data = {this.state.messages}
                    data={messagesList}
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

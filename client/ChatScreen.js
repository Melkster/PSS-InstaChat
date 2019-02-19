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
    constructor(props) {
        super(props);
        this.state = {
            newText: '',
            username: this.props.navigation.getParam('name', 'unknown'),
            chatId: this.props.navigation.getParam('chatId', 'unknown'),
            pickerValue: this.props.navigation.getParam('chatName', 'unknown'), // Make sure the drop-down list will select the right chatroom's name
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
                    username: this.state.username,
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
            <KeyboardAvoidingView style={styles.container} keyboardVerticalOffset={85} behavior="padding">
                <Picker
                    mode="dropdown"
                    selectedValue = {this.state.pickerValue}
                    //onValueChange = { (itemValue, itemIndex) => this.setState( {pickerValue: itemValue} ) }
                    onValueChange = { (itemValue, itemIndex) => this.onPickerValueChange(itemValue, itemIndex) }
                >
                {chatRoomsList.map( (item, index) => {return( <Picker.Item label={item.name} value={item.name} key={index} />)} )}
                </Picker>

                <Text style={styles.welcome}>Welcome to {this.state.chatId}, {this.state.username}!</Text>

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

import React from "react";
import {
    AsyncStorage, Alert, Button, Keyboard, TouchableHighlight, View,
    StyleSheet, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView
} from "react-native";
import {createStackNavigator, createAppContainer} from "react-navigation";


import ChatItem from './ChatItem.js';
import messagesList from './MessagesList';
import styles from './styles';

class HomeScreen extends React.Component {

    state = {
        'name': '',
        'userId': 'h7h7h7', // change this to whatever
        'chats': [
            {'ChatID': 'ABC123'},
            {'ChatID': 'DEF345'}
            ]
    }

    componentDidMount = () => AsyncStorage.getItem('name').then((value) => this.setState({'name': value}))

    setName = (value) => {
        // An example of how information can be stored in client
        AsyncStorage.setItem('name', value);
        this.setState({'name': value});
    }

    onPressCreate() {
        Alert.alert('This should create a chatroom')
    }

    onPressJoin() {
        Alert.alert('This should join a chatroom')
    }

    render() {
        return (

            <View style={styles.container}>
                <Text style={styles.headline}>InstaChat</Text>
                <View style={styles.buttonContainer}>
                    <TextInput style={styles.textInput}
                               placeholder='Enter your nickname'
                               onChangeText={this.setName}
                               onSubmitEditing={Keyboard.dismiss}
                    />
                    <Text>
                        Your nickname is: {this.state.name}
                    </Text>
                </View>
                <View style={styles.buttonContainer}>
                    <Button
                        onPress={this.onPressCreate}
                        title="Create"
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <Button
                        onPress={this.onPressJoin}
                        title="Join"
                    />
                </View>
{/*                <View style={styles.buttonContainer}>
                    <Button
                        title="Send message (just for testing)"
                        onPress={() => this.props.navigation.navigate('MessageToServer')}
                    />
                </View>*/}
                <View style={styles.buttonContainer}>
                    <Button
                        title="Go to Chats"
                        onPress={() => this.props.navigation.navigate('Chats', {
                            name: this.state.name,
                            chatId: this.state.chats[0].ChatID})
                        }
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <Button
                        title="Info"
                        onPress={() => this.props.navigation.navigate('Info', {
                            currentState: this.state })
                        }
                    />
                </View>
            </View>

        );
    }
}

/*class MessageToServer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {message: ''}
        this.submitMessage = this.submitMessage.bind(this);
    }

    submitMessage() {
        // THIS IS WHERE A MESSAGE SHOULD BE SENT TO SERVER
        alert('Sending: \"' + this.state.message + '\" to server');
    }

    render() {
        return (
            //<View><Text>{this.state.message}</Text></View>
            <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Type your message!"
                    onChangeText={(message) => this.setState({message})}
                />
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={this.submitMessage}
                >
                    <Text style={styles.submitButtonText}> Submit </Text>
                </TouchableOpacity>
            </View>
        );
    }
}*/

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
            const newMessage = {
                id: 2,
                text: this.state.newText,
                author: {
                    id: 2,
                    username: 'Shang',
                }
            };
            messagesList.reverse().push(newMessage);
            messagesList.reverse()
            this.setState((prevState) => {
                return {newText: ''};
            });
            this.textInput.clear();
            Keyboard.dismiss();
            this.refs.flatList.scrollToEnd();
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

class InfoScreen extends React.Component {
    constructor(props) {
        super(props);
    }

    printChats = (chats) => {
        var s = '';
        for(var i = 0; i < chats.length; i++) {
            s = s + chats[i].ChatID + "\n";
        }
        return s;

    };

    render() {
        const { navigation } = this.props;
        const state = navigation.getParam('currentState', 'unknown');
        return (
            <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
                <Text style={{fontSize:20}}> Current Info:{"\n" }</Text>
                <Text>Name: { state.name+"\n\n" }
                userId: { state.userId+"\n\n" }
                Current chats: { '\n' + this.printChats(state.chats) }
                </Text>


            </View>
        );
    }
}

const AppNavigator = createStackNavigator(
    {
        Home: HomeScreen,
        //MessageToServer: MessageToServer,
        Chats: ChatScreen,
        Info: InfoScreen
    },
    {
        initialRouteName: "Home"
    }
);

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
    render() {
        return <AppContainer/>;
    }
}
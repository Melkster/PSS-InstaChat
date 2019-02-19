import React from "react";
import {
    AsyncStorage, Alert, Button, Keyboard, TouchableHighlight, View,
    StyleSheet, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView
} from "react-native";
import {createStackNavigator, createAppContainer} from "react-navigation";

import ChatSelect from './ChatSelect';
import ChatScreen from './ChatScreen';
import InfoScreen from './InfoScreen';
import CreateScreen from './CreateScreen';
import styles from './styles';

// Ignores yellow warnings, showed up when going to view with websockets.
console.ignoredYellowBox = ["Remote debugger"];
import { YellowBox } from "react-native";
YellowBox.ignoreWarnings([
    "Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?"
]);

class HomeScreen extends React.Component {

    state = {
        'name': '',
        'userID': 'h7h7h7', // change this to whatever
        'chats': [
            {'name': 'BestChat', 'ChatID': 'ABC123'},
            {'name': 'CoolChat', 'ChatID': 'DEF345'}
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
                        onPress={() => this.props.navigation.navigate('Create', {
                            currentState: this.state })
                        }
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
                            currentState: this.state })
                        }
                    />
                </View>
{/*                <View style={styles.buttonContainer}>
                    <Button
                        title="Chatroom"
                        onPress={() => this.props.navigation.navigate('Chatroom', {
                            name: this.state.name,
                            chatId: this.state.chats[0].ChatID})
                        }
                    />
                </View>*/}
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

const AppNavigator = createStackNavigator(
    {
        Home: HomeScreen,
        //MessageToServer: MessageToServer,
        Create: CreateScreen,
        Chats: ChatSelect,
        Chatroom: ChatScreen,
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
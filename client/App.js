import React from "react";
import {
    AsyncStorage, Alert, Button, Keyboard, TouchableHighlight, View,
    StyleSheet, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView
} from "react-native";
import {createStackNavigator, createAppContainer} from "react-navigation";

import ChatSelect from './ChatSelect';
import JoinScreen from './JoinScreen';
import ChatScreen from './ChatScreen';
import InfoScreen from './InfoScreen';
import CreateScreen from './CreateScreen';
import socket from './socket';
import styles from './styles';

// Ignores yellow warnings, showed up when going to view with websockets.
console.ignoredYellowBox = ["Remote debugger"];
import { YellowBox } from "react-native";
YellowBox.ignoreWarnings([
    "Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?"
]);

class HomeScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            'name': null,
            'userID': null, // the server should give this
            'chats': [] // {'name': 'BestChat', 'chatID': 'ABC123'}
        };

        socket.on("reconnect", (attempNumber) => {
            console.log('Reconnected with server');
            socket.emit('identification', this.state.userID, this.state.chats);
        });

    }

    /* This section is performed every time the application starts, it tries to load saved information
    and if that information is not found, the information is requested from the server */
    componentDidMount = () => {
        AsyncStorage.getItem('name').then((value) => this.setState({'name': value}));
        AsyncStorage.getItem('chats').then((value) => {
            if(value !== null) {
                this.setState({'chats': JSON.parse(value)});
            }
        });
        AsyncStorage.getItem('userID').then((value) => {
            socket.emit('identification', value, this.chats);
            socket.on('identification', (value) => {
                if (value == null) {
                    alert('Server returned. null');
                } else {
                    alert('Received ' + value + ' from server');
                    AsyncStorage.setItem('userID', value);
                    this.setState({'userID': value});
                }
            });
            this.setState({'userID': value});
        });
    };

    /* This function is sent to the infoscreen, there you can choose to forget the current stored info*/
    removeInfo = () => {
        AsyncStorage.removeItem('name');
        AsyncStorage.removeItem('userID');
        AsyncStorage.removeItem('chats');
        this.state.name = null;
        this.state.userID = null;
        this.state.chats = [];
        alert('Please restart the app');
    };

    setName = (value) => {
        // An example of how information can be stored in client
        AsyncStorage.setItem('name', value);
        this.setState({'name': value});
    };

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
                        title="Join"
                        onPress={() => this.props.navigation.navigate('Join', {
                            currentState: this.state })
                        }
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <Button
                        title="Go to Chats"
                        onPress={() => this.props.navigation.navigate('Chats', {
                            currentState: this.state })
                        }
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <Button
                        title="Info"
                        onPress={() => this.props.navigation.navigate('Info', {
                            currentState: this.state, removeFunc: this.removeInfo})
                        }
                    />
                </View>
            </View>

        );
    }
}

const AppNavigator = createStackNavigator(
    {
        Home: HomeScreen,
        Create: CreateScreen,
        Join: JoinScreen,
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
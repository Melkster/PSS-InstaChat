import React, { Component } from "react";
import {
    AsyncStorage,
    Alert,
    Keyboard,
    TouchableHighlight,
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    ScrollView
} from "react-native";
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from "react-navigation";
import { Container, Header, Title, Content, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, ActionSheet, StyleProvider } from "native-base";
import ChatSelect from "./ChatSelect";
import JoinScreen from "./JoinScreen";
import ChatScreen from "./ChatScreen";
import InfoScreen from "./InfoScreen";
import CreateScreen from "./CreateScreen";
import socket from "./socket";
import styles from "./styles";
import { Font } from "expo";
import { Ionicons } from "@expo/vector-icons";
import getTheme from "./native-base-theme/components";
import material from "./native-base-theme/variables/material";

console.ignoredYellowBox = ["Remote debugger"];
import { YellowBox } from "react-native";
YellowBox.ignoreWarnings([
    "Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?"
]);

class HomeScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: null,
            userID: null, // the server should give this
            chats: [], // {'name': 'BestChat', 'chatID': 'ABC123'}
            loading: true
        };

        socket.on("reconnect", attempNumber => {
            console.log("Reconnected with server");
            socket.emit("identification", this.state.userID, this.state.chats.map(obj => obj.chatID));
        });
    }

    // Re-renders the homescreen when backing from other screens
    willFocus = this.props.navigation.addListener("willFocus", payload => {
        this.forceUpdate();
    });

    /* This section is performed every time the application starts, it tries to load saved information
    and if that information is not found, the information is requested from the server */

    async componentWillMount() {
        await Font.loadAsync({
            Roboto: require("native-base/Fonts/Roboto.ttf"),
            Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
            ...Ionicons.font
        });
        this.setState({ loading: false });
    }
    async componentDidMount() {
        AsyncStorage.getItem("name").then(value => this.setState({ name: value }));
        AsyncStorage.getItem("chats").then(value => {
            if (value !== null) {
                this.setState({ chats: JSON.parse(value) });
            }
        });
        AsyncStorage.getItem("userID").then(value => {
            socket.emit("identification", value, this.state.chats.map(obj => obj.chatID));
            socket.on("identification", value => {
                if (value == null) {
                    alert("Server returned. null");
                } else {
                    alert("Received " + value + " from server");
                    AsyncStorage.setItem("userID", value);
                    this.setState({ userID: value });
                }
            });
            this.setState({ userID: value });
        });
    }

    /* This function is sent to the infoscreen, there you can choose to forget the current stored info*/
    removeInfo = () => {
        AsyncStorage.removeItem("name");
        AsyncStorage.removeItem("userID");
        AsyncStorage.removeItem("chats");
        this.state.name = null;
        this.state.userID = null;
        this.state.chats = [];
        alert("Please restart the app");
    };

    setName = value => {
        // An example of how information can be stored in client
        AsyncStorage.setItem("name", value);
        this.setState({ name: value });
    };

    render() {
        if (this.state.loading) {
            return null;
        }
        return (
            <Container>
                <Header>
                    <Left style={{ flex: 1 }} />
                    <Body style={{ flex: 1 }}>
                        <Title style={{ textAlign: "center", alignSelf: "center" }}>InstaChat</Title>
                    </Body>
                    <Right style={{ flex: 1 }}>
                        <Button
                            transparent
                            onPress={() =>
                                this.props.navigation.navigate("Info", {
                                    currentState: this.state,
                                    removeFunc: this.removeInfo
                                })
                            }
                        >
                            <Icon name="ios-settings" />
                        </Button>
                    </Right>
                </Header>
                <Content>
                    <ScrollView>
                        {this.state.chats.map((chats, index) => (
                            <Button
                                full
                                bordered
                                dark
                                style={styles.chatButtons}
                                key={chats.chatID}
                                onPress={() =>
                                    this.props.navigation.navigate("Chatroom", {
                                        currentState: this.state,
                                        chatID: chats.chatID,
                                        nickname: chats.nickname,
                                        chatName: chats.name
                                    })
                                }
                            >
                                <Text>{chats.name}</Text>
                            </Button>
                        ))}
                    </ScrollView>
                </Content>
                <Footer style={{ height: 50 }}>
                    <Button
                        full
                        iconLeft
                        light
                        style={styles.footerButtons}
                        onPress={() =>
                            this.props.navigation.navigate("Create", {
                                currentState: this.state
                            })
                        }
                    >
                        <Icon name="ios-create" />
                        <Text>Create</Text>
                    </Button>
                    <Button
                        full
                        iconRight
                        light
                        style={styles.footerButtons}
                        onPress={() =>
                            this.props.navigation.navigate("Join", {
                                currentState: this.state
                            })
                        }
                    >
                        <Icon name="ios-chatbubbles" />
                        <Text>Join</Text>
                    </Button>
                </Footer>
            </Container>
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
        headerMode: "none",
        initialRouteName: "Home",
        headerTitleStyle: { alignSelf: "center", textAlign: "center", flex: 1 },
        headerLeft: <View />
    }
);

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
    render() {
        return <AppContainer />;
    }
}

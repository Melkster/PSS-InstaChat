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
import { Container, Header, Title, Content, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, ActionSheet, StyleProvider } from "native-base";
import styles from "./styles";


export default class HomeScreenUI extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: null,
            userID: null, // the server should give this
            chats: [], // {'name': 'BestChat', 'chatID': 'ABC123'}
            loading: true
        };
    }
    render() {
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
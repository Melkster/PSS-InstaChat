import React from "react";
import { Alert, Button, View, Text, TextInput, TouchableOpacity} from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";

const styles = ({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContainer: {
        margin: 20
    },
    submitButton: {
        backgroundColor: '#7a42f4',
        padding: 10,
        margin: 15,
        height: 40,
    },
    submitButtonText:{
        color: 'white'
    }
});

class HomeScreen extends React.Component {

    onPressCreate() {
        Alert.alert('This should create a chatroom')
    }

    onPressJoin() {
        Alert.alert('This should join a chatroom')
    }

    render() {
        return (
            <View style={styles.container}>
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
                <View style={styles.buttonContainer}>
                    <Button
                        title="Go to Chats"
                        onPress={() => this.props.navigation.navigate('Chats')}
                    />
                </View>
            </View>

        );
    }
}

class ChatScreen extends React.Component {
    submitMessage() {
       Alert.alert('Sending message to server');
    }

    render() {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <TextInput
                    style={{height: 40}}
                    placeholder="Type your message!"
                />
                <TouchableOpacity
                    style = {styles.submitButton}
                    onPress = {this.submitMessage}
                >
                    <Text style = {styles.submitButtonText}> Submit </Text>
                </TouchableOpacity>
            </View>
        );
    }
}

/*function add(a, b) {
        return a + b;
}
const add_lambda = (a, b) => a + b;*/

const AppNavigator = createStackNavigator(
    {
        Home: HomeScreen,
        Chats: ChatScreen
    },
    {
        initialRouteName: "Home"
    }
);

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
    render() {
        return <AppContainer />;
    }
}
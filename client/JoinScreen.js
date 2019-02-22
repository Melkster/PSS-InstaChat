import React from "react";
import {
    Alert, View, Text, TextInput, TouchableHighlight,
} from "react-native";
import styles from './styles';

class JoinScreen extends React.Component {
    onJoinButtonPressed() {
        //should push user information to the server, including username, userID
        Alert.alert('Join a chatroom!')
    }

    render() {
        return (
            <View style={styles.createScreenView}>
                <TextInput
                    style={styles.chatRoomName}
                    placeholder="Enter Chatroom Name"
                />
                <TouchableHighlight
                    style={styles.chatRoomNameSubmit}
                    onPress={this.onJoinButtonPressed.bind(this)}
                >
                    <Text style={{color: 'white'}}>Join</Text>
                </TouchableHighlight>
            </View>
        );
    }
}

export default JoinScreen;
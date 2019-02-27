import React from "react";
import {
    Button, View, Text, ScrollView
} from "react-native";
import styles from './styles';
import chatRoomsList from './ChatRoomsList';

class ChatSelect extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { navigation } = this.props;
        const state = navigation.getParam('currentState', 'unknown');

        return (
            <View>
                <Text style={styles.headline}>Chatselect</Text>
                <ScrollView>
                    {
                        state.chats.map((item, index) => (
                            <View key = {item.chatID} style={styles.buttonContainer}>
                                <Button
                                    title={item.name}
                                    onPress={() => this.props.navigation.navigate('Chatroom', {
                                        currentState: state,
                                        chatID: item.chatID,
                                        nickname: item.nickname,
                                        chatName: item.name})
                                    }
                                />
                            </View>

                        ))
                    }
                </ScrollView>
            </View>
        );
    }
}

export default ChatSelect;

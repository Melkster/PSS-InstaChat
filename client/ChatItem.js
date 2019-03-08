import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';

/*
MESSAGE FORMAT
{
    username: _,
    time: _,
    chatID: _,
    message: _,
    event: _, // boolean: true if server msg.
}
*/
class ChatItem extends Component {
    render() {
        const message = this.props.message;
        const nickname = this.props.nickname;
        const isMyMessage = message.username == nickname; // maybe this should be decided/taged by the server later
        let textContainerExtra = isMyMessage ? styles.textContainerRight : styles.textContainerLeft;
        let messageStyle = styles.message;

        /* In case the server sends out an event this if statement should execute */
        if(message.event) {
            textContainerExtra = styles.textContainerServer;
            messageStyle = styles.servermsg;
        }

        return (
            <View style={styles.messageContainer} >

                <View style={[styles.textContainer, textContainerExtra]} >
                    <Text style={styles.sender} >{message.username}</Text>
                    <Text style={messageStyle} >{message.message}</Text>
                </View>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    messageContainer: {
        flexDirection: 'row',
        padding: 10,
        //transform: [{ scaleX: -1 }, { scaleY: -1 }],
    },
    textContainer: {
        flexDirection: 'column',
        marginLeft: 20,
        marginRight: 20,
        flex: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        //transform: [{ scaleX: -1 }, { scaleY: -1 }],
    },
    textContainerLeft: {
        alignItems: 'flex-start',
        backgroundColor: '#d5d8d4',
    },
    textContainerRight: {
        alignItems: 'flex-end',
        backgroundColor: '#66db30',
    },
    textContainerServer: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    sender: {
        fontWeight: 'bold',
        //paddingRight: 10,
    },
    message: {
        fontSize: 16,
    },
    servermsg: {
        color: 'red',
    },
});

export default ChatItem;

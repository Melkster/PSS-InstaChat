import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';

class ChatItem extends Component {
    render() {
        const message = this.props.message;
        const isMyMessage = message.author.id == 2;
        const textContainerExtra = isMyMessage ? styles.textContainerRight : styles.textContainerLeft;
        return (
            <View style={styles.messageContainer} >

                <View style={[styles.textContainer, textContainerExtra]} >
                    <Text style={styles.sender} >{message.author.username}</Text>
                    <Text style={styles.message} >{message.text}</Text>
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
    sender: {
        fontWeight: 'bold',
        //paddingRight: 10,
    },
    message: {
        fontSize: 16,
    },
});

export default ChatItem;
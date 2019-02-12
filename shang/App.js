import React, {Component} from 'react';
import {StyleSheet, Text, View, TextInput, TouchableHighlight, FlatList, Keyboard} from 'react-native';

import ChatItem from './ChatItem.js';

type Props = {};
export default class App extends Component<Props> {
  constructor() {
    super();
    this.state = {
        messages: [
            {
                id: 1,
                text: 'Hello World.',
                author: {
                    id: 1,
                    username: 'Computer',
                }
            },
            {
                id: 2,
                text: 'Hi',
                author: {
                    id: 2,
                    username: 'Shang',
                }
            },
        ]
    }
  }
  // After user press the "Send" button, TextInput will be clear.
  _onSendButtonPressed() {
    this.textInput.clear();
    Keyboard.dismiss();
  }

  renderChatItem({item}) {
    return <ChatItem message={item} />
    //return <Text>{item.text}</Text>
  }

  keyExtractor = (item, index) => index.toString();

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native!</Text>

        <FlatList
            inverted
            data = {this.state.messages}
            renderItem={this.renderChatItem}
            keyExtractor={this.keyExtractor}
        />

        <View style={styles.messageBar}>
            <TextInput style={styles.messageBox}
                placeholder="Enter message"
                //onFocus="this.placeholder = ''"
                //onBlur="this.placeholder = 'enter your text'"
                ref={input => {this.textInput = input;}}
            />

            <TouchableHighlight style={styles.sendButton}
                onPress={this._onSendButtonPressed.bind(this)}
            >
                <Text style={{color: 'white'}}>Send</Text>
            </TouchableHighlight>
        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  messageBar: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  messageBox: {
    borderWidth: 2,
    borderColor: 'black',
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 1,
    flex: 1,
  },
  sendButton: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    backgroundColor: 'black'
  },
});

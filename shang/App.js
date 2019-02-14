import React, {Component} from 'react';
import {StyleSheet, Text, View, TextInput, TouchableHighlight, FlatList, Keyboard, KeyboardAvoidingView} from 'react-native';

import ChatItem from './ChatItem.js';
import messagesList from './MessagesList';

type Props = {};

export default class App extends Component<Props> {
  constructor() {
    super();
    this.state = {
        newText:'',
    }
  }

  // After user press the "Send" button, TextInput will be clear.
  _onSendButtonPressed() {
    if (this.state.newText.length != 0) {
        const newMessage = {
            id: 2,
            text: this.state.newText,
            author: {
                id: 2,
                username: 'Shang',
            }
        };
        messagesList.reverse().push(newMessage);
        messagesList.reverse()
        this.setState( (prevState) => { return {newText: ''}; } );
        this.textInput.clear();
        Keyboard.dismiss();
        this.refs.flatList.scrollToEnd();
    }
    else {
        Keyboard.dismiss();
    }
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
            ref={"flatList"}
            inverted
            //data = {this.state.messages}
            data = {messagesList}
            renderItem={this.renderChatItem}
            keyExtractor={this.keyExtractor}
            ListFooterComponent={this.renderFooter}
        />

        <View style={styles.messageBar}>
            <TextInput style={styles.messageBox}
                placeholder="Enter message"
                //onFocus="this.placeholder = ''"
                //onBlur="this.placeholder = 'enter your text'"
                ref={input => {this.textInput = input;}}
                onChangeText = { (text) => this.setState( {newText: text} ) }
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

import React, {Component} from "react";
import {
    View, Text, AsyncStorage, FlatList, TouchableHighlight, Alert,
} from "react-native";
import styles from './styles';

class SelectItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            props: this.props.props,
            currentState: this.props.currentState,
            refreshKey: null,
        };
    }
    /**
    *If user pressed quit, an alert will pop out.
    *If users press 'yes' button, then delete item from 'chats' array
    *and AsyncStorage.setItem as 'chats'.
    *Finally, socket.emit("leaveChat", this.state.currentState.userID, this.props.item.chatID); to server.js.
    */
    _onQuitButtonPressed(currentState) {
        this.setState({refreshKey: this.props.index});
        console.log('Pressing Quit Button.');
        Alert.alert(
        'Alert',
        'Are you sure you want to quit this chatroom?',
        [
            {text: 'No', onPress: () => console.log('Cancel Quit.'), style:'cancel'},
            {text: 'Yes', onPress: () => {
                console.log('Confirm Quit.');
                console.log(`${this.state.currentState.userID} quit from ${this.props.item.name}(${this.props.item.chatID})`);
                this.state.currentState.chats.splice(this.props.index, 1);
                //Next line is to refresh FlatList after quit a chatroom
                this.props.parentList.refreshFlatList(this.state.refreshKey);
                AsyncStorage.setItem('chats', JSON.stringify(this.state.currentState.chats));
                socket.emit("leaveChat", this.state.currentState.userID, this.props.item.chatID);
            }},
        ],
        { cancelable: true }
        );
    }

    render() {
        return(
            <View style={{flex: 1, flexDirection: 'column', backgroundColor: 'black',}} >
                <View style={{flex: 1, flexDirection: 'row',}} >
                    <TouchableHighlight
                        style={{flex:5, backgroundColor: 'black', paddingHorizontal: 3,}}
                        onPress={() => this.state.props.navigation.navigate('Chatroom', {
                            currentState: this.state.currentState,
                            chatName: this.props.item.name,
                            chatID: this.props.item.chatID,
                            nickname: this.props.item.nickname,})
                        }
                    >
                        <View style={{flex: 1, flexDirection: 'column', height: 75,}} >
                            <Text
                                style={{color: 'white', paddingHorizontal: 10, fontSize: 28,}}
                            >
                                {this.props.item.name}
                            </Text>
                            <Text style={{color: 'white', paddingHorizontal: 10, fontSize: 18,}} >
                                {this.props.item.chatID}
                            </Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight
                        style={{flex:1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'gray', paddingHorizontal: 3,}}
                        onPress={this._onQuitButtonPressed.bind(this)}
                    >
                        <Text style={{color: 'white'}}>Quit</Text>
                    </TouchableHighlight>
                </View>
                <View style={{height: 2, backgroundColor: 'white',}} >
                </View>
            </View>
        );
    }
}
export default SelectItem;
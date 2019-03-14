import React, {Component} from "react";
import {
    View, FlatList,
} from "react-native";
import styles from './styles';
import SelectItem from './SelectItem.js';

class ChatSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            props: this.props,
            currentState: this.props.navigation.getParam('currentState', 'unknown'),
            deletedRowKey: null,
        };
    }

    keyExtractor = (item, index) => index.toString();

    //Refresh FlatList by changing a state value
    refreshFlatList = (deletedKey) => {
        this.setState((prevState) => {
            return {deletedRowKey: deletedKey};
        });
    }

    render() {
        return (
            <View style={{flex: 1,}} >
                <FlatList
                    data = {this.state.currentState.chats}
                    renderItem = { ({item, index}) => {
                        return (
                            <SelectItem
                                item={item}
                                index={index}
                                currentState={this.state.currentState}
                                props={this.state.props}
                                parentList={this}
                            >
                            </SelectItem>
                        );
                    }}
                    keyExtractor={this.keyExtractor}
                >
                </FlatList>
            </View>
        );
    }
}

export default ChatSelect;
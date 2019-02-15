import React from "react";
import {
    View, Text
} from "react-native";
class InfoScreen extends React.Component {
    constructor(props) {
        super(props);
    }

    printChats = (chats) => {
        var s = '';
        for(var i = 0; i < chats.length; i++) {
            s = s + chats[i].ChatID + "\n";
        }
        return s;

    };

    render() {
        const { navigation } = this.props;
        const state = navigation.getParam('currentState', 'unknown');
        return (
            <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
                <Text style={{fontSize:20}}> Current Info:{"\n" }</Text>
                <Text>Name: { state.name+"\n\n" }
                    userId: { state.userId+"\n\n" }
                    Current chats: { '\n' + this.printChats(state.chats) }
                </Text>


            </View>
        );
    }
}

export default InfoScreen;

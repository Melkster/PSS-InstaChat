import React from 'react';
import {Alert,Button,StyleSheet, Text, View} from 'react-native';

export default class App extends React.Component {

    onPressCreate() {
        Alert.alert('This should create a chatroom')
    }

    onPressJoin() {
        Alert.alert('This should join a chatroom')
    }

    onPressOngoing() {
        Alert.alert('This should change the view!')
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
                        onPress={this.onPressOngoing}
                        title="Ongoing"
                    />
                </View>
            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContainer: {
        margin: 20
    }
});

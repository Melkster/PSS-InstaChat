import React from "react";
import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
    headline: {
        fontSize:20,
        fontWeight:'bold',
        textAlign: 'center'
    },
    container: {
        flex: 1,
    },
    buttonContainer: {
        margin: 20
    },
    submitButton: {
        backgroundColor: '#7a42f4',
        padding: 10,
        margin: 15,
        height: 40,
    },
    submitButtonText:{
        color: 'white'
    },
    textInput:{
        borderWidth: 1,
        padding: 10
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    messageBar: {
        height: 40,
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
export default styles;
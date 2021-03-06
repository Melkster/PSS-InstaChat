import React from "react";
import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
    headline: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center"
    },
    container: {
        flex: 1
    },
    buttonContainer: {
        margin: 20
    },
    submitButton: {
        backgroundColor: "#7a42f4",
        padding: 10,
        margin: 15,
        height: 40
    },
    submitButtonText: {
        color: "white"
    },
    textInput: {
        borderWidth: 1,
        padding: 10
    },
    welcome: {
        fontSize: 20,
        textAlign: "center",
        margin: 10
    },
    messageBar: {
        height: 40,
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "white"
    },
    messageBox: {
        borderWidth: 2,
        borderColor: "black",
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 1,
        flex: 1
    },
    sendButton: {
        width: 60,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 3,
        backgroundColor: "black"
    },
    createScreenView: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
    },
    chatRoomName: {
        borderWidth: 2,
        borderColor: "black",
        width: 300,
        height: 50,
        paddingHorizontal: 10,
        marginVertical: 50
    },
    chatRoomName2: {
        borderWidth: 2,
        borderColor: "black",
        width: 300,
        height: 50,
        paddingHorizontal: 20,
        marginVertical: 10
    },
    chatRoomNameSubmit: {
        width: 150,
        height: 50,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center"
    },
    homeScreenButton: {
        alignSelf: "center",
        width: 120,
        justifyContent: "center",
        marginVertical: 10
    },
    footerButtons: {
        //position: "absolute",
        flex: 1,
        //left: 0,
        //right: 0,
        //bottom: -10,
        flexDirection: "row",
        height: 50,
        alignItems: "center"
    },
    chatButtons: {
        height: 60
    },
    scanWrapper: {
        overflow: 'hidden',
        width: 260,
        height: 200
    },
});
export default styles;

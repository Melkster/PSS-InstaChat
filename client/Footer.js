import React, { Component } from "react";
import JoinScreen from "./JoinScreen";
import ChatSelect from "./ChatSelect";
import CreateScreen from "./CreateScreen";
import { createBottomTabNavigator, createAppContainer } from "react-navigation";
import { Button, Text, Icon, Item, Footer, FooterTab, Label } from "native-base";
const MainNavigator = createBottomTabNavigator(
    {
        JoinScreen: { screen: JoinScreen  },
        ChatScreen: { screen: ChatSelect },
        CreateScreen: { screen: CreateScreen }
    },
    {
        // tabBarPosition: "bottom",
        tabBarComponent: props => {
            return (
                <Footer>
                    <FooterTab>
                        <Button vertical onPress={() => props.navigation.navigate("CreateScreen")}>
                            <Icon name="ios-create" />
                            <Text>Create</Text>
                        </Button>
                        <Button vertical onPress={() => props.navigation.navigate("ChatSelect")}>
                            <Icon name="md-chatboxes" />
                            <Text>Chats</Text>
                        </Button>
                        <Button vertical onPress={() => props.navigation.navigate("JoinScreen")}>
                            <Icon name="ios-chatbubbles" />
                            <Text>Join</Text>
                        </Button>
                    </FooterTab>
                </Footer>

                // <Footer>
                //     <FooterTab>
                //         <Button vertical active={props.navigationState.index === 0} onPress={() => props.navigation.navigate("LucyChat")}>
                //             <Icon name="bowtie" />
                //             <Text>Lucy</Text>
                //         </Button>
                //         <Button vertical active={props.navigationState.index === 1} onPress={() => props.navigation.navigate("JadeChat")}>
                //             <Icon name="briefcase" />
                //             <Text>Nine</Text>
                //         </Button>
                //         <Button vertical active={props.navigationState.index === 2} onPress={() => props.navigation.navigate("NineChat")}>
                //             <Icon name="headset" />
                //             <Text>Jade</Text>
                //         </Button>
                //     </FooterTab>
                // </Footer>
            );
        }
    }
);

const MainScreenNavigator = createAppContainer(MainNavigator);
export default MainScreenNavigator;
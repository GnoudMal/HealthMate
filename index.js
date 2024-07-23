/**
 * @format
 */
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import PushNotification from "react-native-push-notification";

PushNotification.configure({
    onRegister: function (token) {
        console.log("TOKEN:", token);
    },
    requestPermissions: true,
});

AppRegistry.registerComponent(appName, () => App);


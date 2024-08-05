/**
 * @format
 */
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import PushNotification from "react-native-push-notification";
import TrackPlayer from 'react-native-track-player';
import { playbackService } from './src/service/servicePlay';
import { LogBox } from 'react-native';

PushNotification.configure({
    onRegister: function (token) {
        console.log("TOKEN:", token);
    },
    requestPermissions: true,
});

TrackPlayer.registerPlaybackService(() => playbackService);

AppRegistry.registerComponent(appName, () => App);

LogBox.ignoreAllLogs();



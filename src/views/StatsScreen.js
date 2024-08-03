import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const NotificationsScreen = () => {
    const [notifications, setNotifications] = useState([]);
    const navigation = useNavigation(); // Khai báo hook điều hướng

    useEffect(() => {
        PushNotification.configure({
            onRegister: function (token) {
                console.log("TOKEN:", token);
            },
            onNotification: function (notification) {
                Alert.alert('Thông báo', notification.message);
                console.log('check u', notification.userInfo);

                // Điều hướng khi ấn vào thông báo
                if (notification.userInfo && notification.userInfo.conversationId) {
                    navigation.navigate(notification, { conversationId: notification.userInfo.conversationId });
                }

                if (Platform.OS === 'ios') {
                    notification.finish(PushNotificationIOS.FetchResult.NoData);
                }
            },
            popInitialNotification: true,
            requestPermissions: Platform.OS === 'ios',
        });

        if (Platform.OS === 'android') {
            PushNotification.createChannel(
                {
                    channelId: 'default-channel-id',
                    channelName: 'Default Channel',
                    channelDescription: 'A default channel',
                    soundName: 'default',
                    importance: 4,
                    vibrate: true,
                    ticker: "Có thông báo mới",
                    largeIcon: 'img_health',
                    color: 'green',
                    smallIcon: 'img_health',
                },
                (created) => console.log(`CreateChannel returned '${created}'`)
            );
        }

        const unsubscribe = firestore()
            .collection('Users')
            .doc(auth().currentUser.uid)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    console.log(userData.notifications[0].from);

                    const newNotifications = userData.notifications || [];

                    if (newNotifications.length > notifications.length) {
                        const newNotification = newNotifications[newNotifications.length - 1];
                        PushNotification.localNotification({
                            channelId: 'default-channel-id',
                            title: 'New Message',
                            message: newNotification.content,
                            playSound: true,
                            soundName: 'default',
                            userInfo: {
                                conversationId: newNotification.conversationId,
                                nav: newNotifications[0].from,
                            },
                            largeIcon: 'img_health',
                            color: 'green',
                            smallIcon: 'img_health',
                        });
                        console.log('New notification sent');
                    }

                    setNotifications(newNotifications);
                }
            });

        return () => unsubscribe();
    }, []);

    const formatTimestamp = (timestamp) => {
        if (typeof timestamp === 'string') {
            const date = new Date(timestamp); // Tạo đối tượng Date từ chuỗi ISO 8601
            return date.toLocaleString();
        }
        return 'Chưa có thời gian';
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.titleHeader}>Thông Báo</Text>
            <FlatList
                data={notifications}
                renderItem={({ item }) => (
                    <View style={styles.notificationContainer}>
                        <Icon name='notifications' size={24} color='black' />
                        <View style={{ marginLeft: 20 }}>
                            <Text style={styles.notificationText}>{item.content}</Text>
                            <Text style={styles.notificationTime}>{formatTimestamp(item.createdAt)}</Text>
                        </View>
                    </View>
                )}
                keyExtractor={(item, index) => index.toString()}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    notificationContainer: {
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flexDirection: 'row'
    },
    notificationText: {
        fontSize: 16,
    },
    notificationTime: {
        fontSize: 12,
        color: '#666',
    },
    titleHeader: {
        color: 'black',
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});

export default NotificationsScreen;

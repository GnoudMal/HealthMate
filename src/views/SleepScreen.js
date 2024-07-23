import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, Platform, Touchable, TouchableOpacity, Image, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import PushNotification from 'react-native-push-notification';
import { Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const screenWidth = Dimensions.get('window').width;

const SleepScreen = ({ navigation }) => {
    const [userId, setUserId] = useState(null);
    const [sleepData, setSleepData] = useState([0, 0, 0, 0, 0, 0, 0]);
    const [sleepGoal, setSleepGoal] = useState({ start: '22:00', end: '06:00' });
    const [isSettingGoal, setIsSettingGoal] = useState(false);
    const [tempStart, setTempStart] = useState(new Date());
    const [tempEnd, setTempEnd] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [isSleeping, setIsSleeping] = useState(false); // Trạng thái Sleep/Stop
    const [sleepStartTime, setSleepStartTime] = useState(null);
    const [currentSleepRecordId, setCurrentSleepRecordId] = useState(null);

    useEffect(() => {
        configureNotifications();
        fetchSleepData();
        checkSleepStatus();
    }, [userId]);

    useEffect(() => {
        const getUserId = async () => {
            try {
                const id = await AsyncStorage.getItem('userId');
                if (id !== null) {
                    setUserId(id);
                } else {
                    console.warn('No userId found in AsyncStorage');
                }
            } catch (error) {
                console.error('Failed to load userId from AsyncStorage', error);
            }
        };

        getUserId();
    }, []);

    const checkSleepStatus = async () => {
        try {
            const sleepStatus = await AsyncStorage.getItem('isSleeping');
            if (sleepStatus === 'true') {
                const startTime = await AsyncStorage.getItem('sleepStartTime');
                const recordId = await AsyncStorage.getItem('currentSleepRecordId');
                if (startTime) {
                    setSleepStartTime(new Date(startTime));
                    setIsSleeping(true);
                    setCurrentSleepRecordId(recordId);
                } else {
                    setIsSleeping(false);
                }
            }
        } catch (error) {
            console.error('Failed to load sleep status from AsyncStorage', error);
        }
    };

    const configureNotifications = () => {
        PushNotification.configure({
            onRegister: function (token) {
                console.log("TOKEN:", token);
            },
            onNotification: function (notification) {
                Alert.alert('Thông báo', notification.message);
                notification.finish(PushNotificationIOS.FetchResult.NoData);
            },
            popInitialNotification: true,
            requestPermissions: Platform.OS === 'ios',
        });

        if (Platform.OS === 'android') {
            PushNotification.createChannel(
                {
                    channelId: 'default-channel-id', // (required)
                    channelName: 'Default Channel', // (required)
                    channelDescription: 'A default channel', // (optional)
                    soundName: 'default', // (optional)
                    importance: 4, // (optional) - 4 is the highest priority
                    vibrate: true, // (optional) - if you want vibration
                    ticker: "Có thông báo mới",
                },
                (created) => console.log(`CreateChannel returned '${created}'`) // (optional)
            );
        }
        // scheduleNotification();
    };

    const fetchSleepData = async () => {
        if (userId) {
            try {
                const now = new Date();
                const startOfWeek = now.getDate() - now.getDay(); // Chủ nhật
                const startDate = new Date(now.setDate(startOfWeek));
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6); // Thứ bảy

                const snapshot = await firestore().collection('sleepRecords')
                    .where('userId', '==', userId)
                    .where('createdAt', '>=', startDate)
                    .where('createdAt', '<=', endDate)
                    .get();

                const weeklyData = [0, 6, 0, 0, 0, 0, 0]; // Mặc định 0 giờ cho mỗi ngày trong tuần

                snapshot.docs.forEach(doc => {
                    const data = doc.data();
                    const startTime = new Date(data.startTime);
                    if (data.endTime) {
                        const endTime = new Date(data.endTime);
                        const duration = (endTime - startTime) / 1000 / 3600; // Tính giờ

                        const dayOfWeek = startTime.getDay();
                        weeklyData[dayOfWeek] += duration;
                    }
                });

                console.log('Weekly Data:', weeklyData); // Kiểm tra dữ liệu được tải về
                setSleepData(weeklyData);
            } catch (error) {
                console.error("Error fetching sleep data from Firestore", error);
                Alert.alert("Lỗi", "Không thể tải dữ liệu giấc ngủ.");
            }
        }
    };


    const saveSleepGoalToFirestore = async (startTime, endTime) => {
        const now = new Date();
        try {
            await firestore().collection('sleepTimes').doc(userId).set({
                updatedAt: now,
                startTime,
                endTime,
            });
            console.log("Sleep goal saved successfully!");
            // Schedule notifications after saving to Firestore
            scheduleNotification(startTime, endTime);
        } catch (error) {
            console.error("Error saving sleep goal to Firestore", error);
        }
    };

    const scheduleNotification = (startTime, endTime) => {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        const now = new Date();
        const sleepTime = new Date();
        sleepTime.setHours(startHour, startMinute, 0, 0);

        const wakeUpTime = new Date();
        wakeUpTime.setHours(endHour, endMinute, 0, 0);

        if (now > sleepTime) {
            sleepTime.setDate(sleepTime.getDate() + 1);
        }

        PushNotification.localNotificationSchedule({
            ticker: "Có thông báo mới",
            message: "Đã đến giờ đi ngủ!",
            date: sleepTime,
            allowWhileIdle: true,
            largeIcon: 'img_health',
            color: 'green',
            smallIcon: 'img_health',
            channelId: 'default-channel-id',
        });

        PushNotification.localNotificationSchedule({
            ticker: "Có thông báo mới",
            message: "Đã đến giờ thức dậy!",
            date: wakeUpTime,
            allowWhileIdle: true,
            largeIcon: 'img_health',
            color: 'green',
            smallIcon: 'img_health',
            channelId: 'default-channel-id',
        });
    };

    const handleSetSleepGoal = () => {
        setIsSettingGoal(true);
    };

    const saveSleepGoal = () => {
        const startTime = tempStart.toTimeString().slice(0, 5);
        const endTime = tempEnd.toTimeString().slice(0, 5);
        setSleepGoal({ start: startTime, end: endTime });
        setIsSettingGoal(false);
        saveSleepGoalToFirestore(startTime, endTime);
    };

    const checkSleepAdequacy = () => {
        const lastNightSleep = sleepData[sleepData.length - 1];
        console.log(lastNightSleep);
        if (lastNightSleep >= 6 && lastNightSleep <= 7.5) {
            Alert.alert("Thông báo", "Bạn đã ngủ đủ giấc đêm qua!");
        } else {
            Alert.alert("Thông báo", "Bạn không ngủ đủ giấc đêm qua!");
        }
    };

    const handleSleepToggle = async () => {
        if (isSleeping) {
            const endTime = new Date();
            console.log(endTime);
            console.log(sleepStartTime);
            const sleepDuration = (endTime - sleepStartTime) / 1000 / 3600;
            console.log(endTime - sleepStartTime);
            setSleepData(prevData => {
                const dayOfWeek = sleepStartTime.getDay();
                const newData = [...prevData];
                newData[dayOfWeek] += sleepDuration;
                return newData;
            });

            if (userId) {
                try {
                    if (currentSleepRecordId) {
                        console.log(currentSleepRecordId);
                        await firestore().collection('sleepRecords').doc(currentSleepRecordId).update({
                            endTime: endTime.toISOString(),
                            duration: sleepDuration,
                            status: 'ended', // Cập nhật trạng thái
                        });
                        console.log("Sleep record updated successfully!");
                    }
                } catch (error) {
                    console.error("Error updating sleep record in Firestore", error);
                }
            }

            setIsSleeping(false);
            setSleepStartTime(null);
            await AsyncStorage.setItem('isSleeping', 'false');
            await AsyncStorage.removeItem('sleepStartTime');
            await AsyncStorage.removeItem('currentSleepRecordId');
            Alert.alert("Thông báo", `Thời gian ngủ: ${sleepDuration.toFixed(2)} giờ`);
        } else {
            const startTime = new Date();
            setSleepStartTime(startTime);
            setIsSleeping(true);
            await AsyncStorage.setItem('isSleeping', 'true');
            await AsyncStorage.setItem('sleepStartTime', startTime.toISOString());
            // setCurrentSleepRecordId(null); // Reset ID bản ghi khi bắt đầu ngủ

            if (userId) {
                try {
                    // Tạo bản ghi giấc ngủ mới
                    const docRef = await firestore().collection('sleepRecords').add({
                        userId,
                        startTime: new Date().toISOString(),
                        endTime: null,
                        duration: 0,
                        status: 'started', // Trạng thái bắt đầu giấc ngủ
                        createdAt: new Date(),
                    });
                    setCurrentSleepRecordId(docRef.id); // Lưu ID của bản ghi giấc ngủ mới
                    console.log("Sleep record created successfully!");
                    await AsyncStorage.setItem('currentSleepRecordId', docRef.id);
                } catch (error) {
                    console.error("Error creating sleep record in Firestore", error);
                }
            }
        }
    };

    const getLastNightSleep = () => {
        const today = new Date();
        const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6

        // Nếu hôm nay là Chủ Nhật (0), thì ngày hôm qua là Thứ Bảy (6)
        // Ngược lại, ngày hôm qua là ngày hiện tại trừ 1
        const lastNightIndex = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;

        return sleepData[lastNightIndex];
    };

    const getSleepMessage = () => {
        const sleepHours = getLastNightSleep();
        if (sleepHours < 6) {
            return `Hôm qua bạn đã ngủ ${sleepHours.toFixed(2)} giờ. Thiếu ngủ có thể gây ra mệt mỏi, giảm khả năng tập trung, và ảnh hưởng đến sức khỏe tổng thể của bạn.`;
        } else if (sleepHours >= 6 && sleepHours <= 7.5) {
            return `Hôm qua bạn đã ngủ ${sleepHours.toFixed(2)} giờ! Ngủ đủ giấc giúp bạn cải thiện tâm trạng, tăng cường trí nhớ, và duy trì sức khỏe tốt.`;
        } else {
            return `Hôm qua bạn đã ngủ ${sleepHours.toFixed(2)} giờ. Ngủ quá nhiều có thể dẫn đến cảm giác uể oải và giảm hiệu suất trong ngày.`;
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'flex-start' }}>
                    <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Giấc Ngủ</Text>
                </View>
                <TouchableOpacity style={[styles.btnSetTime, { alignSelf: 'flex-start' }]} onPress={handleSetSleepGoal}>
                    <Text style={styles.textSetTime}>Thiết lập giờ ngủ</Text>
                </TouchableOpacity>
                {isSettingGoal && (
                    <View style={styles.datePickerContainer}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={styles.layoutSetTime}>
                                <Text style={{ color: '#fff', fontWeight: '700', marginBottom: 5, marginLeft: 10 }}>Chọn giờ bắt đầu:</Text>
                                <TouchableOpacity style={styles.btnSetTime} onPress={() => setShowStartPicker(true)}>
                                    <Text style={styles.textSetTime}>
                                        {tempStart ? tempStart.toTimeString().slice(0, 5) : 'Chọn giờ bắt đầu'}
                                    </Text>
                                </TouchableOpacity>
                                {showStartPicker && (
                                    <DateTimePicker
                                        value={tempStart}
                                        mode="time"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={(event, date) => {
                                            setShowStartPicker(false);
                                            if (date) setTempStart(date);
                                        }}
                                    />
                                )}
                            </View>
                            <View style={styles.layoutSetTime}>
                                <Text style={{ color: '#fff', fontWeight: '700', marginBottom: 5, marginLeft: 10 }}>Chọn giờ kết thúc:</Text>
                                <TouchableOpacity style={styles.btnSetTime} onPress={() => setShowEndPicker(true)}>
                                    <Text style={styles.textSetTime}>{tempEnd ? tempEnd.toTimeString().slice(0, 5) : 'Chọn giờ kết thúc'}</Text>
                                </TouchableOpacity>
                                {showEndPicker && (
                                    <DateTimePicker
                                        value={tempEnd}
                                        mode="time"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={(event, date) => {
                                            setShowEndPicker(false);
                                            if (date) setTempEnd(date);
                                        }}
                                    />
                                )}
                            </View>
                        </View>
                        <TouchableOpacity style={{ backgroundColor: '#C58BF2', padding: 10, borderRadius: 14, }} onPress={saveSleepGoal}>
                            <Text style={styles.textSetTime}>Lưu</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <LineChart
                    data={{
                        labels: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
                        datasets: [{ data: sleepData }]
                    }}
                    width={screenWidth - 40}
                    height={220}
                    withVerticalLines={true}
                    withHorizontalLines={true}

                    chartConfig={{
                        backgroundColor: '#272244',
                        backgroundGradientFrom: '#C58BF2',
                        backgroundGradientTo: '#B4C0FE',
                        decimalPlaces: 2,
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `black`,
                        style: {
                            borderRadius: 20
                        },
                        propsForDots: {
                            r: "6",
                            strokeWidth: "2",
                            stroke: "#ffa726"
                        }
                    }}
                    bezier
                    yAxisSuffix="h"
                    style={styles.chart}
                />
                <TouchableOpacity style={{ backgroundColor: '#C58BF2', padding: 10, borderRadius: 14, }} onPress={checkSleepAdequacy}>
                    <Text style={styles.textSetTime}>Kiểm tra giấc ngủ</Text>
                </TouchableOpacity>
                <View style={styles.card}>
                    <Text style={styles.titleRecommenr}>Phân Tích Giấc Ngủ</Text>
                    <Image source={{ uri: 'https://i.pinimg.com/564x/db/c7/1b/dbc71b4e06c8035ccbaa3494000da62d.jpg' }} style={styles.image} />
                    <Text style={styles.textRecommend}>{getSleepMessage()}</Text>
                </View>
                <TouchableOpacity style={styles.btnSleepStop} onPress={handleSleepToggle}>
                    <Text style={styles.textSleepStop}>{isSleeping ? 'Đã Dậy' : 'Ngủ'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#272244',
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    btnBack: {
        // backgroundColor: '#F7F8F8',
        padding: 7,
        borderRadius: 8,
        marginBottom: 16,
        marginRight: 10
    },
    image: {
        alignSelf: 'center',
        width: 320, // Hoặc kích thước bạn mong muốn
        height: 175, // Hoặc kích thước bạn mong muốn
        borderRadius: 10, // Góc bo tròn
        marginBottom: 10, // Khoảng cách dưới ảnh
        resizeMode: 'cover', // Hoặc 'contain', tùy thuộc vào cách bạn muốn hình ảnh vừa với không gian
    },
    title: {
        color: '#fff',
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',

    },
    chart: {
        marginVertical: 20,
        borderRadius: 16,
    },
    datePickerContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    layoutSetTime: {
        marginHorizontal: 20,
        marginBottom: 10,
    },
    btnSetTime: {
        textAlign: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        padding: 12,
        borderRadius: 14,
    },
    textSetTime: {
        fontSize: 15,
        color: '#fff',
        fontWeight: '800',
    },
    btnSleepStop: {
        width: '50%',
        backgroundColor: '#FF4500',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginVertical: 10,
    },
    textSleepStop: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    card: {
        marginHorizontal: 10,
        backgroundColor: 'rgba(233, 217, 95, 1)',
        borderRadius: 10,
        padding: 16,
        marginVertical: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    textRecommend: {
        fontSize: 15,
        fontWeight: '600',
        color: 'black',
    },
    titleRecommenr: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 8,
    }
});

export default SleepScreen;
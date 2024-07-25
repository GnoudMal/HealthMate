import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { addGoalToFirestore, fetchGoals, updateGoal } from '../actions/GoalActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import PushNotification from 'react-native-push-notification';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import { fetchSteps } from '../actions/stepActions';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const CircularProgress = ({ size, strokeWidth, percentage, innerText }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (circumference * percentage) / 100;

    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
                <Defs>
                    <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor="#C58BF2" />
                        <Stop offset="100%" stopColor="#B4C0FE" />
                    </LinearGradient>
                </Defs>
                <Circle
                    stroke="#e6e6e6"
                    fill="transparent"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                <Circle
                    stroke="url(#grad)"
                    fill="transparent"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                />
                <Circle
                    fill="#92A3FD"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius - strokeWidth / 0.8}
                />
            </Svg>
            <View style={styles.innerTextContainer}>
                <Text style={styles.innerText}>{innerText}</Text>
            </View>
        </View >
    );
};



const ActivityScreen = () => {
    const stepsObject = useSelector((state) => {
        console.log('Redux steps state:', state.steps);
        return state.steps;
    });
    const goals = useSelector((state) => state.goal.goals);
    const dispatch = useDispatch();
    const [goalReached, setGoalReached] = useState(false);
    const [userId, setUserId] = useState(null);
    const currentGoal = goals.find(goal => goal.chức_năng === 'Activity') || { mục_tiêu: 0 };
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [notificationTime, setNotificationTime] = useState({ hour: 0, minute: 0 });
    const [tempHour, setTempHour] = useState(new Date());
    const [tempMinute, setTempMinute] = useState(new Date());

    const navigation = useNavigation();

    useEffect(() => {
        configureNotifications();
        const getUserId = async () => {
            try {
                const id = await AsyncStorage.getItem('userId');
                if (id !== null) {
                    setUserId(id);
                    dispatch(fetchGoals(id));
                    dispatch(fetchSteps(id));
                } else {
                    console.warn('No userId found in AsyncStorage');
                }
            } catch (error) {
                console.error('Failed to load userId from AsyncStorage', error);
            }
        };

        getUserId();
    }, [dispatch]);

    useEffect(() => {
        console.log('checklord', stepsObject);
        if (stepsObject) {
            console.log('Updated stepsObject:', stepsObject);
            setGoalReached(stepsObject.steps >= currentGoal.mục_tiêu);
        }
    }, [stepsObject, currentGoal.mục_tiêu]);

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
                // (created) => console.log(`CreateChannel returned '${created}'`) // (optional)
            );
        }
    };

    const startDate = new Date().toISOString();
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const handleGoalUpdate = (additionalSteps) => {
        const newGoalValue = currentGoal.mục_tiêu + additionalSteps;
        console.log('check goal', currentGoal);
        if (currentGoal.id) {

            const newGoalData = {
                chức_năng: 'Activity',
                mục_tiêu: newGoalValue,
                đơn_vị: 'Bước',
                ngày_bắt_đầu: startDate,
                ngày_kết_thúc: endDate.toISOString(),
            };

            dispatch(updateGoal({
                id_user: userId,
                newGoal: newGoalData
            }))
                .then(() => console.log('Goal updated successfully'))
                .catch(error => console.error('Error updating goal:', error));
        } else {
            const newGoalData = {
                chức_năng: 'Activity',
                mục_tiêu: newGoal,
                đơn_vị: 'Bước',
                ngày_bắt_đầu: startDate,
                ngày_kết_thúc: endDate.toISOString(),
                id_user: userId,
            };

            dispatch(addGoalToFirestore({ goal: newGoalData, id_user: userId }))
                .then(() => console.log('Goal added successfully'))
                .catch(error => console.error('Error adding goal:', error));
        }
    };



    const stepsCount = stepsObject && typeof stepsObject.steps === 'number' ? stepsObject.steps : 'N/A';
    const goalText = typeof currentGoal.mục_tiêu === 'number' ? currentGoal.mục_tiêu : 'N/A';

    console.log('day a', stepsObject.steps);
    // console.log(stepsCount);

    const calculateCalories = (steps, distance) => {
        const caloriesPerStep = 0.04;
        const caloriesPerKm = 100;

        const caloriesFromSteps = (steps * caloriesPerStep).toFixed(2);
        const caloriesFromDistance = (distance * caloriesPerKm).toFixed(2);

        return {
            caloriesFromSteps,
            caloriesFromDistance
        };
    };


    const calculateDistanceFromSteps = (steps) => {
        const stepLengthMeters = 0.762;
        const distanceMeters = steps * stepLengthMeters;
        const distanceKilometers = distanceMeters / 1000;
        return distanceKilometers.toFixed(2);
    };

    const distanceToday = calculateDistanceFromSteps(stepsCount);
    const distanceFromTargetSteps = calculateDistanceFromSteps(goalText);

    const { caloriesFromSteps, caloriesFromDistance } = calculateCalories(stepsCount, distanceToday);

    const scheduleNotification = (hour, minute) => {
        const now = new Date();
        const notificationTime = new Date();
        notificationTime.setHours(hour, minute, 0, 0);

        if (now > notificationTime) {
            notificationTime.setDate(notificationTime.getDate() + 1); // Lên lịch thông báo vào ngày tiếp theo
        }

        PushNotification.localNotificationSchedule({
            ticker: "Có thông báo mới",
            message: "Đến giờ hoạt động!",
            date: notificationTime,
            allowWhileIdle: true,
            largeIcon: 'img_health',
            color: 'green',
            smallIcon: 'img_health',
            channelId: 'default-channel-id',
        });
    };



    const saveRunGoalToFirestore = async (formattedTime) => {
        const now = new Date();
        try {
            await firestore().collection('RunTimes').doc(userId).set({
                updatedAt: now,
                notificationTime: formattedTime
            });
            console.log("Run goal saved successfully!");
            // Schedule notifications after saving to Firestore
            const [hour, minute] = formattedTime.split(':').map(Number);
            scheduleNotification(hour, minute);
        } catch (error) {
            console.error("Error saving Run goal to Firestore", error);
        }
    };

    // console.log(stepsCount);
    // console.log(goalText);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Vận Động</Text>
                    <TouchableOpacity style={styles.btnNotify} onPress={() => setShowDatePicker(true)}>
                        <Icon name="notifications" size={28} color="black" />
                    </TouchableOpacity>
                </View>

                <View style={styles.runSection}>
                    <View>
                        <Text style={styles.runTitle}>Today Run</Text>
                        <Text style={styles.runDistance}>{distanceToday} KM</Text>
                    </View>
                    <View>
                        <Text style={styles.runTitle}>Today Steps</Text>
                        <Text style={styles.runDistance}>{stepsCount} Steps</Text>
                    </View>
                </View>

                <View style={styles.summarySection}>
                    <Text style={styles.summaryTitle}>Summary</Text>
                    <View style={{ marginBottom: 10, alignSelf: 'flex-start' }}>
                        <Text style={styles.calories}>
                            {caloriesFromSteps} <Text style={styles.caloriesLabel}>Kcal - Steps</Text>
                        </Text>
                        <Text style={styles.calories}>
                            {caloriesFromDistance} <Text style={styles.caloriesLabel}>Kcal - Distance</Text>
                        </Text>
                    </View>
                    <CircularProgress
                        size={200}
                        strokeWidth={20}
                        percentage={goalText > 0 ? (stepsCount / goalText) * 100 : 0}
                        innerText={`${Math.round((stepsCount / goalText) * 100)}%`}
                    />
                    <Text style={{ fontSize: 20, color: 'white', alignSelf: 'flex-start', fontWeight: 'bold', marginTop: 10 }}>+ My Target:</Text>
                    <View style={styles.stats}>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{goalText}</Text>
                            <Text style={styles.statLabel}>Steps</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{distanceFromTargetSteps}</Text>
                            <Text style={styles.statLabel}>Distance (KM)</Text>
                        </View>
                    </View>
                    <View style={styles.actionSection}>
                        <TouchableOpacity style={styles.btnUpdateGoal} onPress={() => handleGoalUpdate(1000)} >
                            <Text style={{ fontSize: 16, fontWeight: '700' }}>Update Goal</Text>
                        </TouchableOpacity>
                        <Text style={styles.actionText}>
                            {goalReached ? 'Goal Achieved!' : 'Keep Going!'}
                        </Text>
                    </View>
                </View>
                {showDatePicker && (
                    <DateTimePicker
                        value={selectedDate}
                        mode="time"
                        is24Hour={true}
                        display="spinner"
                        onChange={(event, date) => {
                            if (date) {
                                setSelectedDate(date);
                                const formattedTime = `${date.getHours()}:${date.getMinutes()}`;
                                saveRunGoalToFirestore(formattedTime);
                                setShowDatePicker(false);
                            } else {
                                setShowDatePicker(false);
                            }
                        }}
                    />
                )}


            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#CAC8D6',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    btnBack: {
        // backgroundColor: '#F7F8F8',
        padding: 7,
        borderRadius: 8,
        marginBottom: 16,
        marginRight: 10
    },
    btnNotify: {
        padding: 7,
        borderRadius: 8,
        marginBottom: 16,
        marginRight: 10,
        alignSelf: 'flex-end'
    },
    title: {
        color: 'black',
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',

    },
    greeting: {
        fontSize: 16,
        color: '#666',
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    notificationIcon: {
        marginRight: 16,
    },
    runSection: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        backgroundColor: '#0B0531',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
    },
    runTitle: {
        color: '#fff',
        fontSize: 16,
    },
    runDistance: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    summarySection: {
        backgroundColor: '#272244',
        borderRadius: 10,
        padding: 24,
        alignItems: 'center',
    },
    summaryTitle: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 8,
        alignSelf: 'flex-start'
    },
    calories: {
        color: '#fff',
        fontSize: 48,
        fontWeight: 'bold',
    },
    caloriesLabel: {
        fontSize: 16,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 16,
    },
    statBox: {
        borderWidth: 2,
        borderColor: 'white',
        width: '40%',
        height: 60,
        justifyContent: 'center',
        borderRadius: 10,
        alignItems: 'center',
    },
    statValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    statLabel: {
        color: '#fff',
        fontSize: 14,
    },
    innerTextContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        width: '70%',
        height: '100%',
    },
    innerText: {
        fontSize: 32,
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    actionSection: {
        marginTop: 16,
        alignItems: 'center',
    },
    actionText: {
        fontSize: 18,
        marginTop: 8,
        color: '#fff',
    },
    btnUpdateGoal: {
        elevation: 8,
        padding: 12,
        borderRadius: 15,
        backgroundColor: '#FCA703'
    }
});

export default ActivityScreen;

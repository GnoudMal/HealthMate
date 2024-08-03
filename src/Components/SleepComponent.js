import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LineChart } from 'react-native-chart-kit';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../service/ThemeContext';

const screenWidth = Dimensions.get('window').width;

const SleepComponent = () => {
    const { isDarkMode, animatedTheme } = useContext(ThemeContext);
    const [sleepData, setSleepData] = useState([0, 0, 0]); // Dữ liệu giấc ngủ cho 3 ngày gần nhất
    const [userId, setUserId] = useState(null);
    const [todaySleepTime, setTodaySleepTime] = useState('0h 0m');

    console.log('slep date', sleepData);

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

    useEffect(() => {
        if (userId) {
            const unsubscribe = firestore().collection('sleepRecords')
                .where('userId', '==', userId)
                .onSnapshot(snapshot => {
                    fetchSleepData(snapshot);
                }, error => {
                    console.error('Error fetching sleep data from Firestore', error);
                    Alert.alert('Lỗi', 'Không thể tải dữ liệu giấc ngủ.');
                });

            return () => unsubscribe();
        }
    }, [userId]);

    const fetchSleepData = (snapshot) => {
        const now = new Date();
        const endDate = new Date(now.setHours(23, 59, 59, 999)); // Ngày hôm nay đến hết ngày
        const startDate = new Date(now.setHours(0, 0, 0, 0));
        startDate.setDate(startDate.getDate() - 2); // 2 ngày trước

        const dailyData = [6, 0, 0];
        let totalSleepToday = 0;

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const startTime = new Date(data.startTime);
            if (data.endTime) {
                const endTime = new Date(data.endTime);
                const duration = (endTime - startTime) / 1000 / 3600; // Tính giờ

                const dayIndex = Math.floor((endDate - startTime) / (1000 * 60 * 60 * 24));
                if (dayIndex >= 0 && dayIndex < 3) {
                    dailyData[2 - dayIndex] += duration; // Đảo ngược thứ tự ngày
                }

                if (startTime.toDateString() === endDate.toDateString()) {
                    totalSleepToday += duration;
                }
            }
        });

        const roundedData = dailyData.map(value => parseFloat(value.toFixed(2)));

        setSleepData(roundedData);
        const hours = Math.floor(totalSleepToday);
        const minutes = Math.round((totalSleepToday - hours) * 60);
        setTodaySleepTime(`${hours}h ${minutes}m`);
    };

    console.log('ngu', sleepData);

    const data = {
        labels: ['Ngày 1', 'Ngày 2', 'Ngày 3'],
        datasets: [
            {
                data: sleepData,
                strokeWidth: 2,
            },
        ],
    };

    const chartConfig = {
        backgroundGradientFrom: 'white',
        backgroundGradientTo: 'white',
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        barPercentage: 0.5,
        fillShadowGradient: `rgba(245, 148, 39, 0.8)`,
        fillShadowGradientOpacity: 1,
        withVerticalLabels: true,
        withHorizontalLabels: true,
        labelFormatter: (value) => `${value.toFixed(2)}h`,
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#ccc' : 'rgba(68, 211, 224, 0.5)' }]}>
            <View style={{ flexDirection: 'row' }}>
                <Icon name={'moon'} size={24} color="black" />
                <View style={{ marginStart: 5 }}>
                    <Text style={styles.title}>Sleep</Text>
                    <Text style={styles.sleepTime}>{todaySleepTime}</Text>
                </View>
            </View>

            <View style={styles.graph}>
                <LineChart
                    data={data}
                    width={133}
                    height={79}
                    chartConfig={chartConfig}
                    verticalLabelRotation={0}
                    withInnerLines={true}
                    withHorizontalLabels={true}
                    showBarTops={true}
                    fromZero={true}
                    showValuesOnTopOfBars={true}
                    style={{
                        borderRadius: 10,
                        alignSelf: 'flex-start',
                    }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 150,
        height: 150,
        padding: 10,

        borderRadius: 20,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#36454F',
    },
    sleepTime: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#36454F',
        marginVertical: 10,
    },
    graph: {
        height: 70,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SleepComponent;

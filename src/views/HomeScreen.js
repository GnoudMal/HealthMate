import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../Components/Header';
import BMIComponent from '../Components/BMI';
import WaterIntakeComponent from '../Components/WaterIntake';
import SleepComponent from '../Components/SleepComponent';
import CategoryButtons from '../Components/CategoryButtons ';
import CaloriesComponent from '../Components/CaloriesComponent';
import StepsComponent from '../Components/StepsComponents';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserInfo } from '../redux/actions/userAction';
import { ThemeContext } from '../service/ThemeContext';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';

const HomeScreen = () => {
    const dispatch = useDispatch();
    const { userInfo, error } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const [userId, setUserId] = useState(null);
    const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);

    useEffect(() => {
        const getUserId = async () => {
            try {
                const id = await AsyncStorage.getItem('userId');
                if (id !== null) {
                    setUserId(id);
                } else {
                    console.warn('Không tìm thấy userId trong AsyncStorage');
                }
            } catch (error) {
                console.error('Không thể tải userId từ AsyncStorage', error);
            }
        };

        getUserId();
    }, []);

    useEffect(() => {
        if (userId) {
            dispatch(fetchUserInfo(userId));
        }
    }, [dispatch, userId]);

    useEffect(() => {
        if (userInfo || error) {
            setLoading(false);
        }
    }, [userInfo, error]);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const token = await messaging().getToken();
                console.log('FCM Token:', token);

                // Save the token to Firestore
                if (userId) {
                    await firestore()
                        .collection('Users')
                        .doc(userId)
                        .set({ fcmToken: token }, { merge: true });
                }
            } catch (error) {
                console.error('Error fetching FCM token:', error);
            }
        };

        fetchToken();

        // Listen for token refresh
        const unsubscribe = messaging().onTokenRefresh(async (newToken) => {
            console.log('New FCM Token:', newToken);
            if (userId) {
                await firestore()
                    .collection('Users')
                    .doc(userId)
                    .set({ fcmToken: newToken }, { merge: true });
            }
        });

        return () => unsubscribe();
    }, [userId]);

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#36454F" />
                <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, isDarkMode ? styles.darkMode : styles.lightMode]}>
            <Header username={userInfo ? userInfo.username : 'Guest'} />

            {userInfo && <BMIComponent userInfo={userInfo} />}
            <CategoryButtons navigation={navigation} />
            <View style={styles.componentsContainer}>
                <View>
                    <WaterIntakeComponent />
                </View>
                <View style={{ justifyContent: 'space-around' }}>
                    <SleepComponent />
                    <CaloriesComponent />
                    <StepsComponent />
                </View>
            </View>
            <View style={{ height: 50 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        color: '#A0A0A0',
        marginTop: 10,
    },
    componentsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    switch: {
        marginBottom: 10,
    },
    lightMode: {
        backgroundColor: '#fff',
    },
    darkMode: {
        backgroundColor: '#333',
    },
});

export default HomeScreen;

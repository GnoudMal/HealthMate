import React, { useEffect, useState } from 'react';
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

const HomeScreen = () => {

    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();


    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userInfoJSON = await AsyncStorage.getItem('userInfo');
                console.log("check data", userInfoJSON);
                if (userInfoJSON !== null) {
                    setUserInfo(JSON.parse(userInfoJSON));
                }
            } catch (error) {
                console.error('Failed to fetch user info from AsyncStorage', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#36454F" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Header username={userInfo.username} />
            <BMIComponent userInfo={userInfo} />
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

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 20,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfoText: {
        fontSize: 18,
        marginBottom: 10,
        color: '#36454F',
        textAlign: 'center',
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
});

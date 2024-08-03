import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Foundation';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { fetchSteps } from '../redux/actions/stepActions';

const StepsComponent = () => {
    const stepsObject = useSelector((state) => state.steps.steps);
    const dispatch = useDispatch();

    useEffect(() => {
        const getUserId = async () => {
            try {
                const id = await AsyncStorage.getItem('userId');
                console.log('id user', id);
                if (id !== null) {
                    fetchStepsData(id);
                } else {
                    console.warn('No userId found in AsyncStorage');
                }
            } catch (error) {
                console.error('Failed to load userId from AsyncStorage', error);
            }
        };

        getUserId();
    }, [dispatch, fetchStepsData]);

    const fetchStepsData = useCallback(
        _.debounce(async (userId) => {
            try {
                await dispatch(fetchSteps(userId));
            } catch (error) {
                console.error('Error fetching steps:', error);
            }
        }, 1000), // Adjust the debounce delay as needed
        [dispatch]
    );


    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name={'foot'} size={24} color="black" />
                <Text style={styles.stepsCount}> {stepsObject} <Text style={{ color: "#36454F" }}>Bước</Text></Text>
            </View>
            <View style={styles.progressBarBackground}>
                <View style={styles.progressBarFill1} />
                <View style={styles.progressBarFill2} />
                <View style={styles.progressBarFill3} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 150,
        height: 74,
        padding: 10,
        backgroundColor: 'rgba(212, 211, 210, 0.6)',
        borderRadius: 20,
    },
    stepsCount: {
        marginStart: 5,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFB660',
        marginVertical: 10,
    },
    progressBarBackground: {
        height: 10,
        backgroundColor: '#F0E4FF',
        borderRadius: 5,
        overflow: 'hidden',
    },
    // progressBarFill1: {
    //     width: '33.3333333333%',
    //     height: '100%',
    //     backgroundColor: '#FAF2AA',
    //     zIndex: -1,
    // },
    progressBarFill2: {
        width: '66.6666666667%',
        height: '100%',
        backgroundColor: '#FFB660',
        zIndex: 1000,
    },
});

export default StepsComponent;

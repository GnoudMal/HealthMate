import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGoals } from '../redux/actions/GoalActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../service/ThemeContext';

const calculateCaloriesFromSteps = (steps) => {
    const caloriesPerStep = 0.04; // Adjust this value based on your needs
    return steps * caloriesPerStep;
};

const CircularProgress = ({ size, strokeWidth, percentage, innerText }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (circumference * percentage) / 100;

    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
                <Defs>
                    <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor="#FF6D7F" />
                        <Stop offset="100%" stopColor="#FF6D7F" />
                    </LinearGradient>
                </Defs>
                <Circle
                    stroke="#FCBCC1"
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

            </Svg>
            <View style={styles.innerTextContainer}>
                <Text style={styles.innerText}>{innerText}</Text>
            </View>
        </View>
    );
};

const CaloriesComponent = () => {
    const { isDarkMode, animatedTheme } = useContext(ThemeContext);
    const dispatch = useDispatch();
    const [userId, setUserId] = useState(null);
    const steps = useSelector((state) => state.steps.steps);
    const goals = useSelector((state) => state.goal.goals); // Assuming goal steps are stored in goal.goalSteps
    const currentGoal = goals.find(goal => goal.chức_năng === 'Activity') || { mục_tiêu: 0 };
    console.log('check cu ren', currentGoal.mục_tiêu);
    console.log(steps);

    const consumedCalories = calculateCaloriesFromSteps(steps);
    const goalCalories = currentGoal.mục_tiêu > 0 ? calculateCaloriesFromSteps(currentGoal.mục_tiêu) : 0;
    const remainingCalories = goalCalories - consumedCalories > 0 ? (goalCalories - consumedCalories) : 0;

    console.log('loi ne', goalCalories + '' + consumedCalories);


    useEffect(() => {
        const getUserId = async () => {
            try {
                const id = await AsyncStorage.getItem('userId');
                console.log('id user', id);
                if (id !== null) {
                    setUserId(id);

                    dispatch(fetchGoals(id));
                } else {
                    console.warn('No userId found in AsyncStorage');
                }
            } catch (error) {
                console.error('Failed to load userId from AsyncStorage', error);
            }
        };

        getUserId();
    }, [dispatch]);

    return (
        <View style={styles.container}>
            <View style={[styles.card, { backgroundColor: isDarkMode ? '#ccc' : '#FBE0E0' }]}>
                <View style={{ alignItems: 'flex-start', alignSelf: 'flex-start', flexDirection: 'row' }}>
                    <Icon name={'fire'} size={24} color="black" />
                    <View >
                        <Text style={styles.cardTitle}>Calories</Text>
                        <Text style={styles.caloriesText}>{consumedCalories.toFixed(2)} kCal</Text>
                    </View>
                </View>
                <CircularProgress
                    size={85}
                    strokeWidth={8}
                    percentage={(goalCalories > 0 ? (consumedCalories / goalCalories) * 100 : 0)}
                    innerText={`${remainingCalories.toFixed(2)} kCal left`}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: 150,
        height: 150,
        backgroundColor: '#FBE0E0',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    cardTitle: {
        color: '#36454F',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    caloriesText: {
        color: '#36454F',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    innerTextContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        width: '70%',
        height: '100%',
    },
    innerText: {
        fontSize: 12,
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default CaloriesComponent;

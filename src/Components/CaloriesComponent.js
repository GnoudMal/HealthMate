import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
                    r={radius - strokeWidth / 1.2}
                />
            </Svg>
            <View style={styles.innerTextContainer}>
                <Text style={styles.innerText}>{innerText}</Text>
            </View>
        </View>
    );
};

const CaloriesComponent = () => {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={{ alignItems: 'flex-start', alignSelf: 'flex-start', flexDirection: 'row' }}>
                    <Icon name={'fire'} size={24} color="black" />
                    <View >
                        <Text style={styles.cardTitle}>Calories</Text>
                        <Text style={styles.caloriesText}>760 kCal</Text>
                    </View>
                </View>
                <CircularProgress
                    size={70}
                    strokeWidth={10}
                    percentage={70}
                    innerText="240 kCal left"
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
        // backgroundColor: '#F5F5F5',
    },
    card: {
        width: 150,
        height: 150,
        backgroundColor: '#FFEB99',
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
        fontSize: 9,
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default CaloriesComponent;

import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ThemeContext } from '../service/ThemeContext';

const WaterIntakeComponent = () => {
    const { isDarkMode, animatedTheme } = useContext(ThemeContext);
    const calculateProgressPercentage = () => {
        const now = new Date();
        const currentHour = now.getHours();

        const timeSlots = [
            { start: 6, end: 8, amount: 600 },
            { start: 9, end: 11, amount: 500 },
            { start: 11, end: 14, amount: 1000 },
            { start: 14, end: 16, amount: 700 },
            { start: 16, end: 24, amount: 900 }
        ];

        let totalAmount = 0;
        let consumedAmount = 0;

        timeSlots.forEach(slot => {
            totalAmount += slot.amount;
            if (currentHour >= slot.start && currentHour < slot.end) {
                const hoursInSlot = slot.end - slot.start;
                const hoursConsumed = currentHour - slot.start;
                consumedAmount += slot.amount * (hoursConsumed / hoursInSlot);
            } else if (currentHour >= slot.end) {
                consumedAmount += slot.amount;
            }
        });

        return (consumedAmount / totalAmount) * 100;
    };

    const progressPercentage = calculateProgressPercentage();

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#333' : '#FFF' }]}>
            <View style={[styles.card, { backgroundColor: isDarkMode ? '#444' : '#FFE4E1' }]}>
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBarBackground, { backgroundColor: isDarkMode ? '#F7F8F8' : '#F7F8F8' }]}>
                        <LinearGradient colors={isDarkMode ? ['#555', '#777'] : ['#C58BF2', '#B4C0FE']} style={[styles.progressBarFill, { height: `${progressPercentage}%` }]} />
                    </View>
                    <View style={styles.timeUpdates}>
                        <Text style={[styles.cardTitle, { color: isDarkMode ? '#FFF' : '#1D242A' }]}>Lượng nước uống</Text>
                        <Text style={[styles.totalLiters, { color: isDarkMode ? '#9DCEFF' : '#9DCEFF' }]}>4 Liters</Text>
                        <Text style={[styles.realTimeUpdates, { color: isDarkMode ? '#CCC' : '#7B6F72' }]}>Cập nhật theo thời gian thực</Text>
                        <View style={styles.timeUpdate}>
                            <View style={[styles.dot, { backgroundColor: isDarkMode ? '#FFF' : '#5e17eb' }]} />
                            <View>
                                <Text style={[styles.timeText, { color: isDarkMode ? '#FFF' : '#555' }]}>6am - 8am</Text>
                                <Text style={[styles.amountText, { color: isDarkMode ? '#FFF' : '#C58BF2' }]}>600ml</Text>
                            </View>
                        </View>
                        <View style={styles.timeUpdate}>
                            <View style={[styles.dot, { backgroundColor: isDarkMode ? '#FFF' : '#5e17eb' }]} />
                            <View>
                                <Text style={[styles.timeText, { color: isDarkMode ? '#FFF' : '#555' }]}>9am - 11am</Text>
                                <Text style={[styles.amountText, { color: isDarkMode ? '#FFF' : '#C58BF2' }]}>500ml</Text>
                            </View>
                        </View>
                        <View style={styles.timeUpdate}>
                            <View style={[styles.dot, { backgroundColor: isDarkMode ? '#FFF' : '#5e17eb' }]} />
                            <View>
                                <Text style={[styles.timeText, { color: isDarkMode ? '#FFF' : '#555' }]}>11am - 2pm</Text>
                                <Text style={[styles.amountText, { color: isDarkMode ? '#FFF' : '#C58BF2' }]}>1000ml</Text>
                            </View>

                        </View>
                        <View style={styles.timeUpdate}>
                            <View style={[styles.dot, { backgroundColor: isDarkMode ? '#FFF' : '#5e17eb' }]} />
                            <View>
                                <Text style={[styles.timeText, { color: isDarkMode ? '#FFF' : '#555' }]}>2pm - 4pm</Text>
                                <Text style={[styles.amountText, { color: isDarkMode ? '#FFF' : '#C58BF2' }]}>700ml</Text>
                            </View>
                        </View>
                        <View style={styles.timeUpdate}>
                            <View style={[styles.dot, styles.currentDot]} />
                            <View>
                                <Text style={[styles.timeText, { color: isDarkMode ? '#FFF' : '#555' }]}>4pm - now</Text>
                                <Text style={[styles.amountText, { color: isDarkMode ? '#FFF' : '#C58BF2' }]}>900ml</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: '#f0f0f0',
    },
    card: {
        width: 200,
        padding: 20,
        backgroundColor: '#FFE4E1',
        borderRadius: 20,
    },
    cardTitle: {
        color: '#1D242A',
        fontSize: 18,
        fontWeight: 'bold',
    },
    totalLiters: {
        fontSize: 16,
        color: '#9DCEFF',
        fontWeight: 'bold',
        marginVertical: 10,
    },
    realTimeUpdates: {
        fontSize: 12,
        color: '#7B6F72',
        marginBottom: 20,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressBarBackground: {
        width: 30,
        height: 360,
        backgroundColor: '#F7F8F8',
        borderRadius: 10,
        overflow: 'hidden',
        marginRight: 20,
    },
    progressBarFill: {
        width: '100%',
        backgroundColor: '#5e17eb',
        position: 'absolute',
        bottom: 0,
    },
    timeUpdates: {
        flex: 1,
    },
    timeUpdate: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    dot: {
        width: 10,
        height: 10,
        backgroundColor: '#5e17eb',
        borderRadius: 5,
        marginRight: 10,
    },
    currentDot: {
        width: 12,
        height: 12,
        backgroundColor: '#5e17eb',
        borderColor: 'white',
        borderWidth: 2,
    },
    timeText: {
        fontSize: 14,
        color: '#555',
        marginRight: 10,
        fontWeight: '800'
    },
    amountText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#C58BF2',
    },
});

export default WaterIntakeComponent;
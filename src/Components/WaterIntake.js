import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const WaterIntakeComponent = () => {
    const progressPercentage = 70;

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.progressContainer}>
                    <View style={styles.progressBarBackground}>
                        <LinearGradient colors={['#C58BF2', '#B4C0FE']} style={[styles.progressBarFill, { height: `${progressPercentage}%` }]} />
                    </View>
                    <View style={styles.timeUpdates}>
                        <Text style={styles.cardTitle}>Water Intake</Text>
                        <Text style={styles.totalLiters}>4 Liters</Text>
                        <Text style={styles.realTimeUpdates}>Real time updates</Text>
                        <View style={styles.timeUpdate}>
                            <View style={styles.dot} />
                            <View>
                                <Text style={styles.timeText}>6am - 8am</Text>
                                <Text style={styles.amountText}>600ml</Text>
                            </View>
                        </View>
                        <View style={styles.timeUpdate}>
                            <View style={styles.dot} />
                            <View>
                                <Text style={styles.timeText}>9am - 11am</Text>
                                <Text style={styles.amountText}>500ml</Text>
                            </View>
                        </View>
                        <View style={styles.timeUpdate}>
                            <View style={styles.dot} />
                            <View>
                                <Text style={styles.timeText}>11am - 2pm</Text>
                                <Text style={styles.amountText}>1000ml</Text>
                            </View>

                        </View>
                        <View style={styles.timeUpdate}>
                            <View style={styles.dot} />
                            <View>
                                <Text style={styles.timeText}>2pm - 4pm</Text>
                                <Text style={styles.amountText}>700ml</Text>
                            </View>
                        </View>
                        <View style={styles.timeUpdate}>
                            <View style={[styles.dot, styles.currentDot]} />
                            <View>
                                <Text style={styles.timeText}>4pm - now</Text>
                                <Text style={styles.amountText}>900ml</Text>
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
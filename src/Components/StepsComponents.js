import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Foundation';

const StepsComponent = () => {
    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name={'foot'} size={24} color="black" />
                <Text style={styles.stepsCount}>1234 <Text style={{ color: "#36454F" }}>Steps</Text></Text>
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

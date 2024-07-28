import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';

const CheckBox = ({ value, onValueChange, label }) => {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onValueChange(!value)}
        >
            <View style={[styles.box, value && styles.checkedBox]}>
                {value && <View style={styles.checkmark} />}
            </View>
            <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    box: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkedBox: {
        backgroundColor: '#4e9bde',
    },
    checkmark: {
        width: 12,
        height: 12,
        backgroundColor: '#fff',
    },
    label: {
        marginLeft: 8,
        fontSize: 16,
    },
});

export default CheckBox;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Header = ({ username }) => {
    return (
        <View style={styles.headerContainer}>
            <View style={{ flexDirection: 'column' }}>
                <Text style={styles.welcomeText}>Welcome Back,</Text>
                <Text style={styles.userName}>{username}</Text>
            </View>
            <MaterialIcons name="notifications-none" size={30} color="black" style={styles.icon} />
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 10,
        paddingVertical: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeText: {
        color: '#ADA4A5',
        fontSize: 16,
    },
    userName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1D1617'
    },
    icon: {
        marginLeft: 'auto',
    },
});

export default Header;

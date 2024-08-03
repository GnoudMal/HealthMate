import React, { useContext } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ThemeContext } from '../service/ThemeContext';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';



const Header = ({ username }) => {
    const { isDarkMode, toggleTheme, animatedTheme } = useContext(ThemeContext);
    const iconColor = isDarkMode ? 'white' : 'black';

    const animatedTextStyle = useAnimatedStyle(() => {
        return {
            color: withTiming(animatedTheme.value === 1 ? 'white' : 'black', { duration: 500 }), // Sử dụng withTiming để tạo hiệu ứng mượt mà
            opacity: withTiming(animatedTheme.value === 1 ? 0.8 : 1, { duration: 20 }), // Thêm thuộc tính opacity để tạo hiệu ứng mờ dần
        };
    });

    return (
        <View style={styles.headerContainer}>
            <View style={{ flexDirection: 'column' }}>
                <Animated.Text style={[styles.welcomeText, animatedTextStyle]}>Welcome Back,</Animated.Text>
                <Animated.Text style={[styles.userName, animatedTextStyle]}>{username}</Animated.Text>
            </View>

            <View style={{ flexDirection: 'row' }}>
                <Switch
                    trackColor={{ false: "#767577", true: "#6A0D91" }}
                    thumbColor={isDarkMode ? "#A34F9A" : "#f4f3f4"}
                    value={isDarkMode}
                    onValueChange={toggleTheme}
                    style={styles.switch}
                    accessibilityLabel="Toggle dark mode"
                    accessibilityHint="Switch between light and dark mode"
                />
                <MaterialIcons
                    name="notifications-none"
                    size={30}
                    color={iconColor}
                    style={styles.icon}
                    accessibilityLabel="Notifications"
                />
            </View>
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
        fontSize: 16,
        fontFamily: 'Poppins_Regular',
    },
    userName: {
        fontSize: 26,
        fontFamily: 'Poppins_Bold',
    },
    icon: {
        marginLeft: 'auto',
    },
    switch: {
        marginHorizontal: 10
    }
});

export default Header;

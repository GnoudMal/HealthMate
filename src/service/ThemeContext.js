import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSharedValue, withTiming } from 'react-native-reanimated';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const animatedTheme = useSharedValue(isDarkMode ? 1 : 0);


    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('theme');
                if (savedTheme) {
                    const darkMode = savedTheme === 'dark';
                    setIsDarkMode(darkMode);
                    animatedTheme.value = withTiming(darkMode ? 1 : 0, { duration: 10 }); // Chuyển sang withTiming để tạo hiệu ứng mượt mà
                }
            } catch (error) {
                console.error('Không thể tải chủ đề từ AsyncStorage', error);
            }
        };

        loadTheme();
    }, []);

    const theme = {
        colors: {
            background: isDarkMode ? '#333' : '#FFF',
            cardBackground: isDarkMode ? '#444' : '#9BFD92',
            pieChartGradientStart: isDarkMode ? '#A34F9A' : '#8BF2D3',
            pieChartGradientEnd: isDarkMode ? '#6A0D91' : '#EEA4CE',
            textColor: isDarkMode ? '#FFFFFF' : '#000000',
            iconBackground: isDarkMode ? '#333333' : '#F1EBEB',
            iconColor: isDarkMode ? '#FFFFFF' : '#000000',
        },
    };

    useEffect(() => {
        const saveTheme = async () => {
            try {
                await AsyncStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            } catch (error) {
                console.error('Không thể lưu chủ đề vào AsyncStorage', error);
            }
        };

        saveTheme();
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prevMode => !prevMode);
        animatedTheme.value = withTiming(isDarkMode ? 0 : 1, { duration: 10 }); // Sử dụng withTiming để tạo hiệu ứng mượt mà
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, animatedTheme, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
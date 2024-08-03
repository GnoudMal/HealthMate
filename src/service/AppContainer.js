// AppContainer.js
import React, { useContext } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { ThemeContext } from './ThemeContext'; // Đảm bảo đường dẫn chính xác

const AppContainer = ({ children }) => {
    const { backgroundColorInterpolation } = useContext(ThemeContext);

    return (
        <Animated.View style={[styles.container, { backgroundColor: backgroundColorInterpolation }]}>
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default AppContainer;

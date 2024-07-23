import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import LottieView from 'lottie-react-native';

const SplashScreenCustom = ({ navigation }) => {
    const fadeAnim = new Animated.Value(0);
    const translateY = new Animated.Value(-100);

    useEffect(() => {
        SplashScreen.hide();  // Ẩn màn hình splash mặc định

        Animated.timing(translateY, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
        }).start();

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
        }).start();

        setTimeout(() => {
            navigation.replace('LoginAccount');
        }, 4850);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Animated.Text
                style={[
                    styles.title,
                    { transform: [{ translateY }] },
                ]}
            >
                HealthMate
            </Animated.Text>
            <LottieView
                source={require('../animation/manchao4.json')}
                autoPlay
                loop
                style={styles.animation}
            />
            <Animated.Text
                style={[
                    styles.text,
                    { opacity: fadeAnim },
                ]}
            >
                * Created by GnoudMal from FPT Polytechnic
            </Animated.Text>
            <View style={{ flexDirection: 'row' }}>
                <Image
                    source={require('../images/FPT_Polytechnic.png')}
                    style={styles.logo}
                />
                <Image
                    source={require('../images/logo_nes.png')}
                    style={styles.logo}
                />
                <Image
                    source={require('../images/logo_foodApp.png')}
                    style={styles.logo}
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
        backgroundColor: '#739F70'
    },
    animation: {
        width: '100%',
        height: 500,
    },
    text: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 20,
        fontStyle: 'italic',
        color: 'black'
    },
    title: {
        fontStyle: 'italic',
        fontSize: 50,
        fontWeight: 'bold',
        marginTop: 50,
        color: 'black'
    },
    logo: {
        width: 90,
        height: 90,
        resizeMode: 'contain',
        marginTop: 10,
    }
});

export default SplashScreenCustom;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, G } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../service/ThemeContext';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const PieChart = ({ size, percentage, innerText }) => {
    const { theme } = useTheme();
    const radius = size / 2;
    const largerRadius = radius * 1.2;
    const angle = (percentage / 100) * 360;
    const largeArcFlag = percentage > 50 ? 1 : 0;
    const endX = radius + largerRadius * Math.cos((angle - 90) * (Math.PI / 180));
    const endY = radius + largerRadius * Math.sin((angle - 90) * (Math.PI / 180));
    const pathData = `
        M ${radius} ${radius}
        L ${radius} -${largerRadius * 0.15}
        A ${largerRadius} ${largerRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}
        Z
    `;

    return (
        <View style={{ width: size + 60, height: size + 50, justifyContent: 'center', alignItems: 'center' }}>
            <Svg height={size + 30} width={size + 45} viewBox={`0 0 ${size + 20} ${size + 30}`}>
                <Defs>
                    <SvgLinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor={theme.colors.pieChartGradientStart} />
                        <Stop offset="100%" stopColor={theme.colors.pieChartGradientEnd} />
                    </SvgLinearGradient>
                </Defs>
                <Circle
                    cx={radius + 10}
                    cy={radius + 10}
                    r={radius}
                    fill={theme.colors.background}
                />
                <G>
                    <Path
                        d={pathData}
                        fill={theme.colors.pieChartGradientStart}
                        transform={`translate(5, 12)`}
                    />
                    <Path
                        d={pathData}
                        fill="#cccccc4d"
                        transform={`translate(5, 15)`}
                    />
                    <Path
                        d={pathData}
                        fill="url(#grad)"
                        transform={`translate(10, 10)`}
                    />
                </G>
            </Svg>
            <Text style={[styles.innerText, { color: theme.colors.textColor }]}>{innerText}</Text>
        </View>
    );
};

const BMIComponent = ({ userInfo }) => {
    const { height, weight, gender } = userInfo;
    const { theme, animatedTheme } = useTheme();



    const calculateBMI = () => {
        const heightInMeter = height / 100;
        return (weight / (heightInMeter * heightInMeter)).toFixed(1);
    };

    const evaluateBMI = () => {
        const bmi = calculateBMI();
        if (gender === 'Nam') {
            if (bmi < 18.5) return 'Thiếu cân';
            else if (bmi >= 18.5 && bmi < 24.9) return 'Bạn có một chỉ số cân nặng bình thường';
            else if (bmi >= 24.9 && bmi < 29.9) return 'Thừa cân';
            else return 'Béo phì';
        } else {
            if (bmi < 18.5) return 'Thiếu cân';
            else if (bmi >= 18.5 && bmi < 23.9) return 'Bạn có một chỉ số cân nặng bình thường';
            else if (bmi >= 23.9 && bmi < 28.9) return 'Thừa cân';
            else return 'Béo phì';
        }
    };

    const animatedCardStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: withTiming(theme.colors.cardBackground, { duration: 500 }),
        };
    });

    const animatedTextStyle = useAnimatedStyle(() => {
        return {
            color: withTiming(animatedTheme.value === 1 ? 'white' : 'black', { duration: 500 }),
        };
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.card, animatedCardStyle]}>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                        <View style={styles.header}>
                            <Text style={[styles.headerText, { color: theme.colors.textColor }]}>{gender}</Text>
                        </View>
                        <Text style={[styles.bodyText, { color: theme.colors.textColor }]}>{height} cm - {weight} kg</Text>
                        <Text style={[styles.bodyText, { color: theme.colors.textColor }]}>{evaluateBMI()}</Text>
                        <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.pieChartGradientStart }]}>
                            <Animated.Text style={[styles.buttonText, animatedTextStyle]}>Xem thêm </Animated.Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.bmiLabel, { color: theme.colors.textColor }]}>BMI (Body Mass Index)</Text>
                        <PieChart size={100} percentage={calculateBMI() * 4} innerText={calculateBMI()} />
                    </View>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: '#a8e6cf',
    },
    card: {
        width: '100%',
        backgroundColor: '#9BFD92',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // marginBottom: 10,
    },
    headerText: {
        color: 'black',
        fontSize: 20,
        // fontWeight: 'bold',
        fontFamily: 'Poppins_SemiBold'
    },
    bodyText: {
        color: 'black',
        fontFamily: 'Poppins_Regular',
        fontWeight: '500',
        fontSize: 14,
        marginBottom: 10,
    },
    innerText: {
        position: 'absolute',
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        left: 85,

    },
    button: {
        marginTop: 20,
        backgroundColor: '#8BF2D3',
        padding: 10,
        borderRadius: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bmiLabel: {
        fontSize: 14,
        fontFamily: 'Poppins_SemiBold',
    },
});

export default BMIComponent;

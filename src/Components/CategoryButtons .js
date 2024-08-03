import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../service/ThemeContext'; // Adjust the path as needed

const CategoryButton = ({ icon, label, onPress }) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.iconBackground }]}>
                <Icon name={icon} size={38} color={theme.colors.iconColor} />
            </View>
            <Text style={[styles.buttonText, { color: theme.colors.textColor }]}>{label}</Text>
        </TouchableOpacity>
    );
};

const CategoryButtons = ({ navigation }) => {
    const handleCategoryPress = (label) => {
        if (label === 'Tinh Thần') {
            navigation.navigate('MindScreen');
        } else if (label === 'Giấc Ngủ') {
            navigation.navigate('SleepScreen')
        } else if (label === 'Ăn Uống') {
            navigation.navigate('HealthScreen')
        } else if (label === 'Thể Chất') {
            navigation.navigate('PhysicalScreen')
        } else {
            navigation.navigate('MentalHealthScreen')
        }
    };

    return (
        <View style={styles.buttonsContainer}>
            <CategoryButton icon="run" label="Thể Chất" onPress={() => handleCategoryPress('Thể Chất')} />
            <CategoryButton icon="brain" label="Tinh Thần" onPress={() => handleCategoryPress('Tinh Thần')} />
            <CategoryButton icon="bed" label="Giấc Ngủ" onPress={() => handleCategoryPress('Giấc Ngủ')} />
            <CategoryButton icon="meditation" label="Sức Khỏe Tinh Thần" onPress={() => handleCategoryPress('Sức Khỏe Tinh Thần')} />
            <CategoryButton icon="carrot" label="Ăn Uống" onPress={() => handleCategoryPress('Ăn Uống')} />
        </View>
    );
};

const styles = StyleSheet.create({
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    button: {
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        borderRadius: 20,
        padding: 12,
    },
    buttonText: {
        fontFamily: 'Poppins_SemiBold',
        fontSize: 12,
        marginTop: 5,
    },
});

export default CategoryButtons;

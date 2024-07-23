import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { color } from 'react-native-elements/dist/helpers';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CategoryButton = ({ icon, label, onPress }) => {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <View style={{
                backgroundColor: '#F1EBEB',
                borderRadius: 20,
                padding: 12,
            }}>
                <Icon name={icon} size={38} color="black" />
            </View>
            <Text style={styles.buttonText}>{label}</Text>
        </TouchableOpacity>
    );
};

const CategoryButtons = ({ navigation }) => {
    const handleCategoryPress = (label) => {
        // Thực hiện điều hướng đến màn hình tương ứng với label ở đây
        if (label === 'Tinh Thần') {
            navigation.navigate('MindScreen');
        } else if (label === 'Giấc Ngủ') {
            navigation.navigate('SleepTracking')
        } else if (label === 'Ăn Uống') {
            navigation.navigate('HealthScreen')
        }
        // Các xử lý điều hướng cho các label khác
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
    buttonText: {
        color: 'black',
        fontSize: 12,
        marginTop: 5,
        fontWeight: 'bold'
    },
});

export default CategoryButtons;

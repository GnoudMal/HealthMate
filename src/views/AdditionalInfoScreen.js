import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdditionalInfoScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [gender, setGender] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');

    const [usernameError, setUsernameError] = useState('');
    const [genderError, setGenderError] = useState('');
    const [heightError, setHeightError] = useState('');
    const [weightError, setWeightError] = useState('');

    const handleSaveInfo = async () => {
        setUsernameError('');
        setGenderError('');
        setHeightError('');
        setWeightError('');

        let isValid = true;

        if (!username) {
            setUsernameError('Username không được để trống.');
            isValid = false;
        }
        if (!gender) {
            setGenderError('Giới tính không được để trống.');
            isValid = false;
        }
        if (!height) {
            setHeightError('Chiều cao không được để trống.');
            isValid = false;
        } else if (isNaN(height)) {
            setHeightError('Chiều cao phải là số.');
            isValid = false;
        }
        if (!weight) {
            setWeightError('Cân nặng không được để trống.');
            isValid = false;
        } else if (isNaN(weight)) {
            setWeightError('Cân nặng phải là số.');
            isValid = false;
        }

        if (!isValid) {
            return;
        }
        const user = auth().currentUser;
        if (!user) {
            Alert.alert('Error', 'User not found. Please log in again.');
            return;
        }

        try {
            const userDocRef = firestore().collection('Users').doc(user.uid);

            await userDocRef.update({
                username,
                gender,
                height,
                weight,
            });

            const updatedUserDoc = await userDocRef.get();
            const userData = updatedUserDoc.data();
            console.log(userData);

            await AsyncStorage.setItem('userInfo', JSON.stringify(userData));

            navigation.navigate('HomeScreen');
        } catch (error) {
            console.error('Error saving user info:', error);
            Alert.alert('Error', 'Failed to save user info. Please try again.');
        }
    };

    return (
        <ScrollView>
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image source={require('../images/yoga_profile.png')} style={styles.image} />
                </View>
                <Text style={styles.title}>Hãy cùng hoàn thiện hồ sơ của bạn nhé</Text>
                <Text style={styles.subtitle}>Nó sẽ giúp chúng tôi hiểu hơn về bạn!</Text>
                <View style={styles.inputContainer}>
                    <View style={styles.inputRow}>
                        <Icon name="person-outline" size={24} color="#A0A0A0" />
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            value={username}
                            onChangeText={setUsername}
                        />
                    </View>
                    {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}

                    <View style={styles.inputRow}>
                        <Icon name="wc" size={24} color="#A0A0A0" />
                        <TextInput
                            style={styles.input}
                            placeholder="Giới Tính"
                            value={gender}
                            onChangeText={setGender}
                        />
                    </View>
                    {genderError ? <Text style={styles.errorText}>{genderError}</Text> : null}

                    <View style={styles.inputRow}>
                        <Icon name="straighten" size={24} color="#A0A0A0" />
                        <TextInput
                            style={styles.input}
                            placeholder="Chiều Cao (cm)"
                            keyboardType="numeric"
                            value={height}
                            onChangeText={setHeight}
                        />
                        <Text style={styles.unitText}>CM</Text>
                    </View>
                    {heightError ? <Text style={styles.errorText}>{heightError}</Text> : null}

                    <View style={styles.inputRow}>
                        <Icon name="fitness-center" size={24} color="#A0A0A0" />
                        <TextInput
                            style={styles.input}
                            placeholder="Cân Nặng (kg)"
                            keyboardType="numeric"
                            value={weight}
                            onChangeText={setWeight}
                        />
                        <Text style={styles.unitText}>KG</Text>
                    </View>
                    {weightError ? <Text style={styles.errorText}>{weightError}</Text> : null}
                </View>
                <TouchableOpacity style={styles.button} onPress={handleSaveInfo}>
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#FFF',
    },
    imageContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    image: {
        width: 330,
        height: 330,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#36454F',
        marginBottom: 5,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#A0A0A0',
        marginBottom: 20,
    },
    inputContainer: {
        width: '100%',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 5,
        backgroundColor: '#f9f9f9',
    },
    input: {
        flex: 1,
        height: 50,
        marginLeft: 10,
    },
    unitText: {
        fontSize: 16,
        color: '#A0A0A0',
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#AFC18E',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        marginTop: 20,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    errorText: {
        color: 'red',
        marginBottom: 15,
    },
});

export default AdditionalInfoScreen;

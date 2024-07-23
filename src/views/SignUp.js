import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Animated, ImageBackground, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const SignUp = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [reTypePassword, setReTypePassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [reTypeSecureTextEntry, setReTypeSecureTextEntry] = useState(true);
    const [yPosition] = useState(new Animated.Value(100));
    const [xPosition] = useState(new Animated.Value(-100));

    useEffect(() => {
        Animated.parallel([
            Animated.timing(
                yPosition,
                {
                    toValue: 0,
                    duration: 700,
                    useNativeDriver: true,
                }
            ),
            Animated.timing(
                xPosition,
                {
                    toValue: 0,
                    duration: 700,
                    useNativeDriver: true,
                }
            )
        ]).start();
    }, []);

    const toggleSecureEntry = () => {
        setSecureTextEntry(!secureTextEntry);
    };

    const toggleReTypeSecureEntry = () => {
        setReTypeSecureTextEntry(!reTypeSecureTextEntry);
    };

    const handleSignUp = async () => {
        try {
            if (password !== reTypePassword) {
                Alert.alert('Error', 'Passwords do not match.');
                return;
            }

            const userCredential = await auth().createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            await firestore().collection('Users').doc(user.uid).set({
                email: user.email,
                role: 'User',
                createdAt: new Date().toISOString(),
            });

            Alert.alert('Sign Up Successful', `Welcome, ${user.email}`);
            navigation.navigate('LoginAccount', { email: email, password: password }); // Pass the email and password
        } catch (error) {
            Alert.alert('Sign Up Failed', error.message);
            console.error(error);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, backgroundColor: 'white' }}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <ImageBackground
                    source={require('../images/bgLogin.png')}
                    style={styles.imageBackground}
                    imageStyle={styles.imageStyle}
                >
                    <Animated.View style={[styles.welcomeContainer, { transform: [{ translateY: yPosition }, { translateX: xPosition }] }]}>
                        <Text style={styles.welcomeText}>Welcome to</Text>
                        <Text style={styles.title}>HealthMate</Text>
                    </Animated.View>
                </ImageBackground>
                <Animated.View style={[styles.formContainer, { transform: [{ translateY: yPosition }] }]}>
                    <Text style={styles.loginText}>Create your account</Text>

                    <View style={styles.inputContainerLogin}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.labelText}>Enter your Email address</Text>
                        </View>
                        <Icon name="email" size={20} color="#8E8E93" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your Email address"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.labelText}>Enter your Password</Text>
                        </View>
                        <Icon name="lock" size={20} color="#8E8E93" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your Password"
                            secureTextEntry={secureTextEntry}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={toggleSecureEntry} style={styles.icon}>
                            <Icon
                                name={secureTextEntry ? 'visibility-off' : 'visibility'}
                                size={20}
                                color="#8E8E93"
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.labelText}>Re-type your Password</Text>
                        </View>
                        <Icon name="lock" size={20} color="#8E8E93" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Re-type your Password"
                            secureTextEntry={reTypeSecureTextEntry}
                            value={reTypePassword}
                            onChangeText={setReTypePassword}
                        />
                        <TouchableOpacity onPress={toggleReTypeSecureEntry} style={styles.icon}>
                            <Icon
                                name={reTypeSecureTextEntry ? 'visibility-off' : 'visibility'}
                                size={20}
                                color="#8E8E93"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.signInButton, { backgroundColor: '#AFC18E' }]}
                        onPress={handleSignUp}
                    >
                        <Text style={styles.signInButtonText}>Create Account</Text>
                    </TouchableOpacity>

                    <Text style={styles.signUpText}>
                        Already have an account?
                        <Text style={styles.signUpLink} onPress={() => navigation.navigate('LoginAccount')}> Sign In</Text>
                    </Text>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    imageBackground: {
        opacity: 0.68,
        height: '90%',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 30,
        position: 'relative',
    },
    imageStyle: {
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    welcomeContainer: {
        marginBottom: 110,
        alignItems: 'flex-start',
    },
    welcomeText: {
        fontSize: 24,
        color: '#000',
    },
    title: {
        fontSize: 50,
        fontWeight: 'bold',
        color: '#000',
    },
    formContainer: {
        position: 'absolute',
        top: '45%',
        marginHorizontal: 20,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        borderBottomEndRadius: 30,
        borderBottomStartRadius: 30,
        paddingVertical: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.8,
        shadowOffset: { width: 5, height: 5 },
        shadowRadius: 15,
    },
    loginText: {
        fontSize: 24,
        color: '#36454F',
        fontWeight: 'bold',
        marginBottom: 30,
    },
    inputContainerLogin: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
        paddingLeft: 5,
        borderWidth: 2,
        borderColor: '#DCDED8',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingLeft: 5,
        borderWidth: 2,
        borderColor: '#DCDED8',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 20,
    },
    labelContainer: {
        position: 'absolute',
        top: -12,
        left: 10,
        backgroundColor: '#fff',
        paddingHorizontal: 5,
    },
    labelText: {
        fontSize: 14,
        color: '#8E8E93',
    },
    icon: {
        paddingHorizontal: 10,
    },
    input: {
        flex: 1,
        height: 40,
        paddingLeft: 10,
        fontSize: 16,
    },
    signInButton: {
        backgroundColor: '#AFC18E',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    signInButtonText: {
        fontWeight: 'bold',
        color: '#36454F',
        fontSize: 18,
    },
    signUpText: {
        textAlign: 'center',
        color: '#8E8E93',
    },
    signUpLink: {
        color: '#FF8C00',
        fontWeight: 'bold',
    },
});

export default SignUp;

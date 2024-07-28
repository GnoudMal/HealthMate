import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Animated, Alert, Modal, Pressable, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setUserId } from '../redux/reducers/userReducer';

const LoginAccount = ({ navigation, route }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [rememberMe, setRememberMe] = useState(false);
    const [yPosition] = useState(new Animated.Value(100));
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        const checkRememberedUser = async () => {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                // Get user info from Firestore using the token
                const userDocument = await firestore().collection('Users').doc(token).get();
                if (userDocument.exists) {
                    console.log('token check' + token);
                    const userData = userDocument.data();
                    await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
                    dispatch(setUserId(token));
                    navigation.navigate('HomeScreen');
                }
            }
        };

        checkRememberedUser();

        if (route.params?.email && route.params?.password) {
            setEmail(route.params.email);
            setPassword(route.params.password);
        }
        Animated.timing(
            yPosition,
            {
                toValue: 0,
                duration: 700,
                useNativeDriver: true,
            }
        ).start();
    }, [route.params, dispatch, navigation]);

    const toggleSecureEntry = () => {
        setSecureTextEntry(!secureTextEntry);
    };

    const toggleRememberMe = () => {
        setRememberMe(!rememberMe);
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setModalMessage('Email và mật khẩu không được để trống.');
            setModalVisible(true);
            return;
        }

        setLoading(true);

        try {
            const userCredential = await auth().signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            console.log(user.uid);

            const userDocument = await firestore().collection('Users').doc(user.uid).get();
            if (userDocument.exists) {
                const userData = userDocument.data();
                if (userData.username && userData.gender && userData.height && userData.weight) {
                    setModalMessage(`Đăng nhập thành công, chào mừng ${user.email}`);
                    console.log('Đăng nhập thành công:', user.uid);
                    console.log('Dữ liệu người dùng:', userData);

                    await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
                    await AsyncStorage.setItem('userId', user.uid);
                    console.log('id reg', user.uid);
                    if (rememberMe) {
                        await AsyncStorage.setItem('userToken', user.uid);
                        console.log('done Token');
                    } else {
                        await AsyncStorage.removeItem('userToken');
                    }

                    // Dispatch và kiểm tra lỗi
                    try {
                        await dispatch(setUserId(user.uid));
                        setModalVisible(true);
                        navigation.navigate('HomeScreen');
                    } catch (dispatchError) {
                        console.error('Dispatch error:', dispatchError);
                        setModalMessage('Đã xảy ra lỗi khi cập nhật thông tin người dùng.');
                        setModalVisible(true);
                    }
                } else {
                    navigation.navigate('AdditionalInfoScreen');
                }
            } else {
                setModalMessage('Tài Khoản chưa được tạo.');
            }
        } catch (error) {
            switch (error.code) {
                case 'auth/network-request-failed':
                    setModalMessage('Có vấn đề về mạng và đường truyền.');
                    setLoading(false);
                    break;
                case 'auth/invalid-email':
                    setModalMessage('Địa chỉ email không hợp lệ.');
                    break;
                case 'auth/user-not-found':
                    setModalMessage('Tài khoản không tồn tại.');
                    break;
                case 'auth/wrong-password':
                    setModalMessage('Mật khẩu không chính xác.');
                    break;
                default:
                    setModalMessage('Đã xảy ra lỗi không xác định.');
                    console.log(error.code);
                    setLoading(false);
                    break;
            }
        } finally {
            setLoading(false);
            setModalVisible(true);
        }
    };


    const handleForgotPassword = async () => {
        if (!email) {
            setModalMessage('Vui lòng nhập địa chỉ email để khôi phục mật khẩu.');
            setModalVisible(true);
            return;
        }

        try {
            await auth().sendPasswordResetEmail(email);
            setModalMessage('Đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hộp thư đến của bạn.');
        } catch (error) {
            setModalMessage('Đã xảy ra lỗi khi gửi yêu cầu khôi phục mật khẩu.');
            console.error('Error sending password reset email:', error);
        } finally {
            setModalVisible(true);
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
                    <Animated.View style={[styles.welcomeContainer, { transform: [{ translateY: yPosition }] }]}>
                        <Text style={styles.welcomeText}>Welcome to</Text>
                        <Text style={styles.title}>HealthMate</Text>
                    </Animated.View>
                </ImageBackground>

                <Animated.View style={[styles.formContainer, { transform: [{ translateY: yPosition }] }]}>
                    <Text style={styles.loginText}>Login to your account to continue</Text>

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
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={secureTextEntry}
                        />
                        <TouchableOpacity onPress={toggleSecureEntry} style={styles.icon}>
                            <Icon
                                name={secureTextEntry ? 'visibility-off' : 'visibility'}
                                size={20}
                                color="#8E8E93"
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.checkboxContainer}>
                        <TouchableOpacity
                            style={styles.checkbox}
                            onPress={toggleRememberMe}
                        >
                            {rememberMe ? (
                                <Icon name="check-box" size={24} color="#FFA500" />
                            ) : (
                                <Icon name="check-box-outline-blank" size={24} color="#8E8E93" />
                            )}
                            <Text style={styles.checkboxText}>Remember me</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.signInButton, { backgroundColor: rememberMe ? '#FFA500' : '#AFC18E' }]}
                        onPress={handleLogin}
                    >
                        <Text style={styles.signInButtonText}>Sign In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.forgotPasswordButton}
                        onPress={() => Alert.alert(
                            'Forgot Password?',
                            'Enter your email address to reset your password.',
                            [
                                {
                                    text: 'Cancel',
                                    onPress: () => console.log('Cancel Pressed'),
                                    style: 'cancel'
                                },
                                {
                                    text: 'OK',
                                    onPress: () => handleForgotPassword(),
                                }
                            ],
                            { cancelable: false }
                        )}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>
                    <Text style={styles.signUpText}>
                        Don’t have an account yet?
                        <Text style={styles.signUpLink} onPress={() => navigation.navigate('SignUp')}> Sign Up</Text>
                    </Text>
                </Animated.View>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    <View style={styles.modalView}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>{modalMessage}</Text>
                            <Pressable
                                style={[styles.modalButton, styles.modalCloseButton]}
                                onPress={() => setModalVisible(!modalVisible)}
                            >
                                <Text style={styles.modalButtonText}>OK</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FFA500" />
                    </View>
                )}
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
        color: 'black'
    },
    signInButton: {
        backgroundColor: '#AFC18E',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
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
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#36454F',
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '70%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',

    },
    modalText: {
        color: 'black',
        textAlign: 'center',
        fontSize: 18,
        marginBottom: 20,
    },
    modalButton: {
        padding: 10,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
    },
    modalCloseButton: {
        backgroundColor: '#00b56bbf',
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        paddingHorizontal: 20,
    },
    forgotPasswordButton: {
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    forgotPasswordText: {
        color: '#AFC18E',
        fontSize: 16,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
});

export default LoginAccount;

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, Image, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserInfo } from '../redux/actions/userAction';
import { useNavigation } from '@react-navigation/native';

const PersonalDetail = () => {
    const dispatch = useDispatch();
    const [userId, setUserId] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [retypePassword, setRetypePassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showRetypePassword, setShowRetypePassword] = useState(false);
    const { userInfo, error } = useSelector((state) => state.user);
    const [hinhAnh, setHinhAnh] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        const getUserId = async () => {
            try {
                const id = await AsyncStorage.getItem('userId');
                if (id !== null) {
                    setUserId(id);
                } else {
                    console.warn('No userId found in AsyncStorage');
                }
            } catch (error) {
                console.error('Failed to load userId from AsyncStorage', error);
            }
        };

        getUserId();
    }, []);

    useEffect(() => {
        const getUserId = async () => {
            try {
                const id = await AsyncStorage.getItem('userId');
                if (id !== null) {
                    setUserId(id);
                    dispatch(fetchUserInfo(id));
                } else {
                    console.warn('No userId found in AsyncStorage');
                }
            } catch (error) {
                console.error('Failed to load userId from AsyncStorage', error);
            }
        };

        getUserId();
    }, [dispatch]);

    useEffect(() => {
        if (userInfo) {
            setName(userInfo.username);
            setEmail(userInfo.email);
            setHinhAnh(userInfo.avatarUrl || 'https://taytou.com/wp-content/uploads/2022/08/Anh-Avatar-dai-dien-mac-dinh-nam-nen-xam.jpeg');
        }
    }, [userInfo]);

    console.log(hinhAnh);

    const chonAnh = useCallback(() => {
        let options = {
            mediaType: 'photo',
            selectionLimit: 1,
        };
        ImagePicker.launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                setHinhAnh(response);
            }
        });
    }, []);

    const uploadImage = async (image) => {
        const { uri } = image.assets[0];
        const filename = uri.substring(uri.lastIndexOf('/') + 1);
        const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
        console.log(uploadUri);
        try {
            await storage().ref(filename).putFile(uploadUri);
            const url = await storage().ref(filename).getDownloadURL();
            setImageUrl(url);
            return url;
        } catch (e) {
            console.log('eror ne');
            console.error(e);
            return null;
        }
    };

    const saveImageUrlToFirestore = async (url) => {
        try {
            await firestore().collection('Users').doc(userId).update({
                avatarUrl: url,
            });
            alert('Image uploaded successfully!');
        } catch (e) {
            console.error(e);
            alert('Failed to save image URL to Firestore.');
        }
    };

    const handleImageUpload = async () => {
        if (hinhAnh) {
            const url = await uploadImage(hinhAnh);
            if (url) {
                await saveImageUrlToFirestore(url);
            }
        }
    };

    useEffect(() => {
        console.log(hinhAnh);
    }, [hinhAnh])


    const handleChangePassword = async () => {
        if (password !== retypePassword) {
            alert('Mật Khẩu Không Khớp!');
            return;
        } else if (password == '' || retypePassword == '') {
            alert('Mật Khẩu không được để trống!');
            return;
        }

        try {
            const user = auth().currentUser;
            if (user) {
                await user.updatePassword(password);
                alert('Password updated successfully!');
            } else {
                alert('No user is currently logged in.');
            }
        } catch (error) {
            console.error('Error updating password:', error);
            alert('Failed to update password. Please try again.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'flex-start' }}>
                    <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Thông Tin</Text>
                </View>
                <View style={{ marginVertical: 15 }}>
                    <TouchableOpacity onPress={chonAnh}>
                        <Image
                            source={{ uri: hinhAnh ? (hinhAnh.assets ? hinhAnh.assets[0].uri : hinhAnh) : 'https://taytou.com/wp-content/uploads/2022/08/Anh-Avatar-dai-dien-mac-dinh-nam-nen-xam.jpeg' }}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                    <Button title="Upload Image" onPress={handleImageUpload} />
                </View>

                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Username"
                />
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                />
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        placeholder="Password"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Icon name={showPassword ? 'eye-slash' : 'eye'} size={18} style={styles.eyeIcon} />
                    </TouchableOpacity>
                </View>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        value={retypePassword}
                        onChangeText={setRetypePassword}
                        secureTextEntry={!showRetypePassword}
                        placeholder="Re-type password"
                    />
                    <TouchableOpacity onPress={() => setShowRetypePassword(!showRetypePassword)}>
                        <Icon name={showRetypePassword ? 'eye-slash' : 'eye'} size={18} style={styles.eyeIcon} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E6E6FA',
    },
    scrollView: {
        alignItems: 'center',
        padding: 20,
    },
    backButton: {
        alignSelf: 'flex-start',
    },
    backButtonText: {
        fontSize: 24,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 10,
        padding: 10,
        marginVertical: 10,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 10,
        padding: 10,
        marginVertical: 10,
    },
    passwordInput: {
        flex: 1,
    },
    title: {
        color: 'black',
        fontSize: 30,
        fontWeight: 'bold',
        marginLeft: 20,
    },
    eyeIcon: {
        marginLeft: 10,
    },
    saveButton: {
        backgroundColor: '#F26E1D',
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 20,
        alignItems: 'center',
        width: '100%',
        marginTop: 14,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    btnBack: {
        width: 30,
        height: 30,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        marginLeft: 10,
    },
});

export default PersonalDetail;

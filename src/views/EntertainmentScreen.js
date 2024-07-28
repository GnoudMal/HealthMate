import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ImageBackground,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Modal,
    TextInput,
    Button,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import TrackPlayer from 'react-native-track-player';
import { addTracks, setupPlayer } from '../service/servicePlay';
import Playlist from '../Components/MusicComponent/playList';
import Header from '../Components/MusicComponent/HeaderMusic';
import TrackProgress from '../Components/MusicComponent/TrackProgress';
import Controls from '../Components/MusicComponent/ControlsMusic';
import { Provider, useDispatch } from 'react-redux';
import { addTrackToFirebase } from '../redux/reducers/trackReducer'; // Import action từ Redux slice
import { fetchTracksFromFirebase } from '../service/firebaseService';
import store from '../redux/store/store';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';

const MentalHealthScreen = () => {
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('');
    const [url, setUrl] = useState('');
    const [artist, setArtist] = useState('');
    const [imageUri, setImageUri] = useState(null);
    const [userId, setUserId] = useState(null);
    const dispatch = useDispatch();
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

    const selectImage = useCallback(() => {
        const options = {
            mediaType: 'photo',
            maxWidth: 300,
            maxHeight: 300,
            quality: 1,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.error('ImagePicker Error: ', response.error);
            } else {
                const uri = response.assets[0].uri;
                setImageUri(uri);
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

    useEffect(() => {
        async function setup() {
            console.log('Initializing player...');
            let isSetup = await setupPlayer();
            if (isSetup) {
                const queue = await TrackPlayer.getQueue();
                if (queue.length === 0) {
                    await addTracks();
                }
                setIsPlayerReady(true);
            } else {
                console.error('Failed to setup TrackPlayer');
                setIsPlayerReady(false);
            }
        }
        setup();
    }, []);

    const handleAddTrack = useCallback(async () => {
        if (!title || !genre || !url) {
            console.error('Please fill all fields');
            return;
        }

        try {
            // Lấy các bài hát hiện có và xác định id tiếp theo
            const tracks = await fetchTracksFromFirebase();
            const newId = (Date.now() + Math.floor(Math.random() * 1000)).toString();

            console.log(newId);

            console.log('artist check ', artist);
            console.log('userId', userId);

            // if (hinhAnh) {
            //     try {
            //         const url = await uploadImage(hinhAnh);
            //         if (url) {
            //             newEntry.image = url;
            //         }
            //     } catch (error) {
            //         console.error('Error uploading image:', error);
            //         alert('Failed to upload image.');
            //         return;
            //     }
            // }

            const newTrack = { id: newId, title, genre, url, artist, imageUri };

            console.log('check ne', newTrack);

            // Lưu bài hát mới vào Firebase
            await dispatch(addTrackToFirebase({ track: newTrack, userId: userId }));
            // Cập nhật TrackPlayer với bài hát mới

            setModalVisible(false);
            setTitle('');
            setGenre('');
            setUrl('');
            setArtist('');
            setImageUri(null);

            console.log('Track added successfully');
        } catch (error) {
            console.error('Error adding track or fetching tracks:', error);
        }
    }, [dispatch, title, genre, url, artist, imageUri]);


    if (!isPlayerReady) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#bbb" />
            </SafeAreaView>
        );
    }

    const renderItem = () => (
        <View style={styles.contentContainer}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>TINH THẦN</Text>
                <TouchableOpacity style={styles.addTrackButton} onPress={() => setModalVisible(true)}>
                    <Icon name='add' size={26} color='black' />
                </TouchableOpacity>
            </View>

            <View style={styles.imageContainer}>
                <ImageBackground
                    source={require('../images/imgMental.png')}
                    style={styles.imageBackground}
                    imageStyle={styles.imageBackgroundImage}
                >
                    <Header />
                    <Image
                        source={require('../images/Thien.png')}
                        style={styles.image}
                    />
                    <TrackProgress />
                    <Controls />
                </ImageBackground>
            </View>

            <Text style={styles.quote}>
                Thiền định không phải là chạy trốn khỏi thế giới, mà là trở về với chính mình.
            </Text>

            <Provider store={store}>
                <Playlist />
            </Provider>

            <View style={styles.playlist}>
                <Text style={styles.playlistTitle}>Workout with experts:</Text>
                <View style={styles.expertContainer}>
                    <TouchableOpacity style={styles.expertCard} onPress={() => navigation.navigate('YogaList')}>
                        <Image
                            source={require('../images/Yoga.png')}
                            style={styles.expertImage}
                        />
                        <Text style={styles.expertText}>Yoga</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.expertCard} onPress={() => navigation.navigate('MeditationList')}>
                        <Image
                            source={require('../images/Meditation.jpg')}
                            style={styles.expertImage}
                        />
                        <Text style={styles.expertText}>Meditation</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New Track</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Title"
                            value={title}
                            onChangeText={setTitle}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Genre"
                            value={genre}
                            onChangeText={setGenre}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Video/Audio Link"
                            value={url}
                            onChangeText={setUrl}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="artist"
                            value={artist}
                            onChangeText={setArtist}
                        />
                        <Button title="Select Image" onPress={selectImage} />
                        {imageUri && (
                            <Image
                                source={{ uri: imageUri }}
                                style={styles.selectedImage}
                            />
                        )}
                        <Button title="Add Track" onPress={handleAddTrack} />
                        <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
                    </View>
                </View>
            </Modal>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={[{}]}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: 16,
    },
    selectedImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginTop: 8,
        marginBottom: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    backButton: {
        borderRadius: 8,
        padding: 7,
        marginBottom: 16,
        marginRight: 10
    },
    addTrackButton: {
        padding: 7,
        marginBottom: 16,

    },
    title: {
        color: 'black',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        flex: 1,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    imageBackground: {
        width: 351,
        height: 366,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        overflow: 'hidden',
        elevation: 8
    },
    imageBackgroundImage: {
        borderRadius: 30,
    },
    image: {
        width: 236,
        height: 232,
        borderRadius: 16,
        marginBottom: 25
    },
    quote: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginVertical: 16,
    },
    playlist: {
        marginBottom: 16,
    },
    playlistTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    expertContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    expertCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingBottom: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    expertImage: {
        width: '100%',
        height: 120,
        borderRadius: 16,
    },
    expertText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 8,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        width: '100%',
        padding: 10,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
});

export default MentalHealthScreen;

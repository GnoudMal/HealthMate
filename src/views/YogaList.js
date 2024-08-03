import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Dimensions, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import YouTubeIframe from 'react-native-youtube-iframe';
import { fetchVideos, addVideo, fetchVideosByType } from '../service/firebaseService';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchVideoTitle } from '../apiService/getApi';

const { width } = Dimensions.get('window');

const YogaList = ({ navigation }) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newVideoTitle, setNewVideoTitle] = useState('');
    const [newVideoId, setNewVideoId] = useState('');
    const [userId, setUserId] = useState(null);

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
        const loadVideos = async () => {
            if (!userId) return;
            setLoading(true);
            try {
                const fetchedVideos = await fetchVideosByType(userId, 'yoga');
                console.log('ú alo', userId);
                setVideos(fetchedVideos);
            } catch (error) {
                // console.log('Error fetching videos:', error);
            } finally {
                setLoading(false);
            }
        };

        loadVideos();
    }, [userId]);

    const handleAddVideo = async () => {
        const videoTitle = await fetchVideoTitle(newVideoId);
        if (!userId) return;
        const newVideo = {
            title: newVideoTitle,
            videoId: newVideoId,
            type: "yoga",
            userId,
        };
        await addVideo(newVideo);
        setNewVideoTitle('');
        setNewVideoId('');
        setModalVisible(false);
        // const fetchedVideos = await fetchVideos(userId);
        setVideos(fetchedVideos);
    };

    const handleVideoIdBlur = async () => {
        const videoTitle = await fetchVideoTitle(newVideoId);
        setNewVideoTitle(videoTitle);
    };

    const renderItem = ({ item }) => (
        <View style={styles.videoContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.youtubeContainer}>
                <YouTubeIframe
                    videoId={item.videoId}
                    height={width * 0.53}
                    play={false}
                    onChangeState={(state) => console.log(state)}
                />
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.emptyText}>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.titleHeader}>Yoga</Text>
                <TouchableOpacity style={styles.addVideoButton} onPress={() => setModalVisible(true)}>
                    <Icon name='add' size={26} color='black' />
                </TouchableOpacity>
            </View>
            <FlatList
                data={videos}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.emptyText}>No videos available</Text>}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Thêm Video</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Tiêu Đề"
                            value={newVideoTitle}
                            onChangeText={setNewVideoTitle}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="YouTube Video ID"
                            value={newVideoId}
                            onChangeText={setNewVideoId}
                            onBlur={handleVideoIdBlur}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleAddVideo}>
                            <Text style={styles.buttonText}>Thêm Video</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                            <Text style={styles.buttonText}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#FFDBDC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    youtubeContainer: {

        borderColor: 'black',
        borderRadius: 20,
        overflow: 'hidden',
    },
    videoContainer: {
        marginBottom: 15,
        backgroundColor: '#FFF',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: 'brown',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 15,
        elevation: 12,
    },
    title: {
        padding: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 18,
        color: '#666',
    },
    titleHeader: {
        color: 'black',
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        flex: 1,
    },
    backButton: {
        borderRadius: 8,
        padding: 7,
        marginBottom: 16,
        marginRight: 10
    },
    addVideoButton: {
        padding: 7,
        marginBottom: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalTitle: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 20,
        fontWeight: 'bold',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
        width: 250,
    },
    button: {
        padding: 10,
        width: '100%',
        height: 40,
        backgroundColor: '#2196F3',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 5,
    },
    cancelButton: {
        backgroundColor: 'red',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default YogaList;

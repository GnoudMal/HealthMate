import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import TrackPlayer, { Capability, usePlaybackState } from 'react-native-track-player';

const setupPlayer = async () => {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
        stopWithApp: true,
        capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Stop,
        ],
    });
    await TrackPlayer.add({
        id: '1',
        url: require('../music/nhacTre.mp3'),
        title: 'Your Audio Title',
        artist: 'Your Artist Name',
        // artwork: require('../images/audio-artwork.png')
    });
};

const MentalHealthScreen = () => {
    const playbackState = usePlaybackState();

    useEffect(() => {
        setupPlayer();

        return () => {
            TrackPlayer.destroy();
        };
    }, []);

    const togglePlayback = async () => {
        if (playbackState === TrackPlayer.STATE_PAUSED || playbackState === TrackPlayer.STATE_STOPPED) {
            await TrackPlayer.play();
        } else {
            await TrackPlayer.pause();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView  >
                <View >
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton}>
                            <Icon name="arrow-back" size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={styles.title}>TINH THẦN</Text>
                    </View>
                </View>

                <View style={styles.imageContainer}>
                    <ImageBackground
                        source={require('../images/imgMental.png')}
                        style={styles.imageBackground}
                        imageStyle={styles.imageBackgroundImage}
                    >
                        <Image
                            source={require('../images/Thien.png')}
                            style={styles.image}
                        />
                    </ImageBackground>
                </View>

                <Text style={styles.quote}>
                    Thiền định không phải là chạy trốn khỏi thế giới, mà là trở về với chính mình.
                </Text>

                <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
                    <Icon name={playbackState === TrackPlayer.STATE_PLAYING ? 'pause' : 'play'} size={24} color="white" />
                </TouchableOpacity>

                <View style={styles.playlist}>
                    <Text style={styles.playlistTitle}>Workout with experts:</Text>
                    <View style={styles.expertContainer}>
                        <TouchableOpacity style={styles.expertCard}>
                            <Image
                                source={require('../images/Yoga.png')}
                                style={styles.expertImage}
                            />
                            <Text style={styles.expertText}>Yoga</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.expertCard}>
                            <Image
                                source={require('../images/Meditation.jpg')}
                                style={styles.expertImage}
                            />
                            <Text style={styles.expertText}>Meditation</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    backButton: {
        padding: 7,
        borderRadius: 8,
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
        borderRadius: 30, // Bo góc cho hình ảnh bên trong ImageBackground
    },
    image: {
        width: 236,
        height: 232,
        borderRadius: 16,
    },
    quote: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginVertical: 16,
    },
    playButton: {
        backgroundColor: '#FF6347',
        padding: 16,
        borderRadius: 30,
        alignSelf: 'center',
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
        height: 150,
        borderRadius: 16,
        marginBottom: 8,
    },
    expertText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default MentalHealthScreen;

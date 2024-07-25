import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ImageBackground,
    TouchableOpacity,
    ActivityIndicator,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import TrackPlayer, {
    useTrackPlayerEvents,
    usePlaybackState,
    useProgress,
    Event,
    State
} from 'react-native-track-player';
import { addTracks, setupPlayer } from '../service/servicePlay';
import Playlist from '../Components/MusicComponent/playList';
import Header from '../Components/MusicComponent/HeaderMusic';
import TrackProgress from '../Components/MusicComponent/TrackProgress';

const MentalHealthScreen = () => {
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    useEffect(() => {
        async function setup() {
            let isSetup = await setupPlayer();
            const queue = await TrackPlayer.getQueue();
            if (isSetup && queue.length <= 0) {
                await addTracks();
            }
            setIsPlayerReady(isSetup);
        }
        setup();
    }, []);

    if (!isPlayerReady) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#bbb" />
            </SafeAreaView>
        );
    }

    const renderItem = ({ item }) => (
        <View style={styles.contentContainer}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>TINH THẦN</Text>
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

            <Header />
            <TrackProgress />
            <Playlist />

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
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={[{}]} // Dữ liệu giả, vì không có dữ liệu thực để hiển thị
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
        borderRadius: 30,
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
    trackProgress: {
        marginTop: 40,
        textAlign: 'center',
        fontSize: 24,
        color: '#eee'
    },
});

export default MentalHealthScreen;

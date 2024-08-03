import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Image
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import TrackPlayer, {
    useTrackPlayerEvents,
    Event,
    State
} from 'react-native-track-player';
import { setupPlayer, addTracks } from '../../service/servicePlay';
import { fetchTracks } from '../../redux/reducers/trackReducer'; // Điều chỉnh đường dẫn
import AsyncStorage from '@react-native-async-storage/async-storage';

function Playlist() {
    const MAX_DISPLAY_ITEMS = 3;
    const dispatch = useDispatch();
    const firestoreTracks = useSelector(state => state.track.tracks);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [displayCount, setDisplayCount] = useState(MAX_DISPLAY_ITEMS);
    const [userId, setUserId] = useState(null);

    const handleLoadMore = () => {
        setDisplayCount(prevCount => prevCount + MAX_DISPLAY_ITEMS);
    };

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
        if (userId) {
            dispatch(fetchTracks({ userId }));
        }
    }, [userId]);

    // Bài hát preload
    const preloadedTracks = [
        {
            id: 'ex1',
            url: 'https://a128-z3.zmdcdn.me/5734ce7b87678872801d6008a6e13003?authen=exp=1722164038~acl=/5734ce7b87678872801d6008a6e13003/*~hmac=a7784073fc26f6e51ce92ecf90b1fd4d',
            title: 'Track 1',
            artist: 'Artist 1',
            imageUri: 'https://tranhgotreotuong.com/wp-content/uploads/2019/08/Ch%E1%BB%AF-T%C3%A2m-trong-th%C6%B0-ph%C3%A1p-th%E1%BB%83-hi%E1%BB%87n-%E1%BB%9F-gi%C3%A1-tr%E1%BB%8B-ngh%E1%BB%87-thu%E1%BA%ADt.jpg'
        },
        {
            id: 'ex2',
            url: 'https://a128-z3.zmdcdn.me/f7e0fbbd9c317640bbffde7bf93e6d56?authen=exp=1722164405~acl=/f7e0fbbd9c317640bbffde7bf93e6d56/*~hmac=5053aaf551d7d80fa22aae5c8a1242c0',
            title: 'Track 2',
            artist: 'Artist 2',
            imageUri: 'https://tranhgotreotuong.com/wp-content/uploads/2019/08/Ch%E1%BB%AF-T%C3%A2m-trong-th%C6%B0-ph%C3%A1p-th%E1%BB%83-hi%E1%BB%87n-%E1%BB%9F-gi%C3%A1-tr%E1%BB%8B-ngh%E1%BB%87-thu%E1%BA%ADt.jpg'
        },
    ];

    // Kết hợp bài hát preload và bài hát từ Firestore
    const combinedTracks = [...preloadedTracks, ...firestoreTracks];

    async function initializePlayer() {
        console.log('Initializing player...');
        try {
            const isSetup = await setupPlayer();
            if (isSetup) {
                console.log('Player setup completed. Adding tracks...');
                await addTracks(); // Thêm bài nhạc preload và từ Firebase
                console.log('Tracks added and fetched.' + firestoreTracks);
            } else {
                console.log('Player setup failed.');
            }
        } catch (error) {
            console.error('Initialization failed:', error);
        }
    }

    useEffect(() => {
        console.log('useEffect called');
        initializePlayer();
    }, []);

    useTrackPlayerEvents([Event.PlaybackState, Event.PlaybackTrackChanged], async (event) => {
        console.log('Playback State Event:', event);

        if (event.state === State.Playing || event.state === State.Paused) {
            try {
                const index = await TrackPlayer.getCurrentTrack();
                if (index !== null) {
                    console.log('Current Track Index:', index);
                    setCurrentTrack(index);
                } else {
                    console.log('Current Track Index is null');
                }
            } catch (error) {
                console.error('Error getting current track:', error);
            }
        }
    });

    function PlaylistItem({ index, title, isCurrent, artist, image }) {
        console.log(image);
        async function handleItemPress() {
            try {
                if (index !== null) {
                    setCurrentTrack(index);
                    await TrackPlayer.skip(index);
                    console.log('Track skipped to index:', index);
                }
            } catch (error) {
                console.error('TrackPlayer.skip error:', error);
            }
        }

        return (
            <TouchableOpacity
                onPress={handleItemPress}
                style={{
                    backgroundColor: isCurrent ? '#666' : 'transparent',
                    borderRadius: 4,
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    flexDirection: 'row',
                    alignItems: 'flex-start'
                }}>
                <Image
                    source={{ uri: image }}
                    style={styles.selectedImage}
                />
                <View>
                    <Text
                        style={{
                            ...styles.playlistItem,
                            color: isCurrent ? 'white' : 'black',
                        }}>
                        {title}
                    </Text>
                    <Text style={{ ...styles.txtArtist, color: isCurrent ? 'white' : 'black' }}>
                        {artist}
                    </Text>
                </View>

            </TouchableOpacity>
        );
    }

    console.log('Queue:', combinedTracks);

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={combinedTracks.slice(0, displayCount)}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                    <PlaylistItem
                        index={index}
                        title={item.title}
                        artist={item.artist}
                        image={item.imageUri}
                        isCurrent={currentTrack === index}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No tracks available</Text>
                    </View>
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#D9D9D9',
        borderRadius: 7,
    },
    playlistItem: {
        fontSize: 16,
        borderRadius: 4,
        color: '#1E1E1E',
        fontWeight: '800'
    },
    selectedImage: {
        marginRight: 5,
        width: 60,
        height: 60,
        borderRadius: 8,
        marginTop: 8,
        marginBottom: 16,
    },
    txtArtist: {
        color: '#1E1E1E',
        fontSize: 14,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#555',
    },
});

export default Playlist;

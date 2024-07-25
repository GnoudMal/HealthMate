import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity
} from 'react-native';
import TrackPlayer, {
    useTrackPlayerEvents,
    Event,
    State
} from 'react-native-track-player';
import Controls from './ControlsMusic';


function Playlist() {
    const [queue, setQueue] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(0);

    async function loadPlaylist() {
        const queue = await TrackPlayer.getQueue();
        console.log('Current Queue:', queue);
        setQueue(queue);
    }

    useEffect(() => {
        loadPlaylist();
    }, []);

    useTrackPlayerEvents([Event.PlaybackState], async (event) => {
        console.log('Playback State Event:', event);
        if (event.state === State.Playing || event.state === State.Paused) {
            let index = await TrackPlayer.getCurrentTrack();
            console.log('Current Track Index:', index); // Log the current track index
            setCurrentTrack(index);
        } else if (event.state == State.nextTrack) {
            TrackPlayer.getCurrentTrack().then((index) => setCurrentTrack(index));
        }
    });


    console.log(currentTrack);

    function PlaylistItem({ index, title, isCurrent }) {

        function handleItemPress() {
            setCurrentTrack(index)
            TrackPlayer.skip(index);
            console.log(isCurrent);
            console.log(index);
            console.log(title);
        }

        return (
            <TouchableOpacity onPress={handleItemPress}>
                <Text
                    style={{
                        ...styles.playlistItem,
                        backgroundColor: isCurrent ? '#666' : 'transparent'
                    }}>
                    {title}
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View>
                <FlatList
                    data={queue}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item, index }) => (
                        <PlaylistItem
                            index={index}
                            title={item.title}
                            isCurrent={currentTrack === index}
                        />
                    )}
                />
            </View>
            <Controls />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#eee',
    },
    playlistItem: {
        fontSize: 16,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        color: '#333'
    },
});

export default Playlist;

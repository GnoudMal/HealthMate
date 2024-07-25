import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import TrackPlayer, {
    useTrackPlayerEvents,
    usePlaybackState,
    Event,
    State
} from 'react-native-track-player';
import Icon from 'react-native-vector-icons/FontAwesome';

function Controls({ onShuffle }) {
    const playerState = usePlaybackState();
    async function handlePlayPress() {
        if (await TrackPlayer.getState() == State.Playing) {
            TrackPlayer.pause();
        }
        else {
            TrackPlayer.play();
        }
    }
    return (
        <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap', alignItems: 'center'
        }}>
            <Icon.Button
                name="arrow-left"
                size={28}
                backgroundColor="transparent"
                color="red"
                onPress={() => TrackPlayer.skipToPrevious()} />
            <Icon.Button
                name={playerState.state == State.Playing ? 'pause' : 'play'}
                size={28}
                backgroundColor="transparent"
                color="blue"
                onPress={handlePlayPress} />
            <Icon.Button
                name="arrow-right"
                size={28}
                backgroundColor="transparent"
                color="red"
                onPress={() => TrackPlayer.skipToNext()} />
        </View>
    );
}

export default Controls

const styles = StyleSheet.create({})
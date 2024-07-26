import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import TrackPlayer, {
    useTrackPlayerEvents,
    usePlaybackState,
    Event,
    State
} from 'react-native-track-player';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Feather';

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
            flexWrap: 'wrap', alignItems: 'center', marginBottom: 14,
        }}>
            <Icon2.Button
                name="skip-back"
                size={20}
                backgroundColor="transparent"
                color="white"
                onPress={() => TrackPlayer.skipToPrevious()} />
            <Icon2.Button
                name={playerState.state == State.Playing ? 'pause' : 'play'}
                size={24}
                backgroundColor="transparent"
                color="black"
                onPress={handlePlayPress} />
            <Icon2.Button
                name="skip-forward"
                size={20}
                backgroundColor="transparent"
                color="white"
                onPress={() => TrackPlayer.skipToNext()} />
        </View>
    );
}

export default Controls

const styles = StyleSheet.create({

})
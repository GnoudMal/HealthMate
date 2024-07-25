import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import TrackPlayer, { Event, State, useTrackPlayerEvents } from "react-native-track-player";

function Header() {
    const [info, setInfo] = useState({});
    useEffect(() => {
        setTrackInfo();
    }, []);
    useTrackPlayerEvents([Event.PlaybackTrackChanged], (event) => {
        if (event.state == State.nextTrack) {
            setTrackInfo();
        }
    });
    async function setTrackInfo() {
        const track = await TrackPlayer.getCurrentTrack();
        const info = await TrackPlayer.getTrack(track);
        setInfo(info);
    }
    return (
        <View>
            <Text style={styles.songTitle}>{info.title}</Text>
            <Text style={styles.artistName}>{info.artist}</Text>
        </View>
    );
}

export default Header;

const styles = StyleSheet.create({
    songTitle: {
        fontSize: 32,
        marginTop: 50,
        color: '#ccc'
    },
    artistName: {
        fontSize: 24,
        color: '#888'
    },
});
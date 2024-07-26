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
        <View style={{ alignSelf: "flex-start", marginStart: 15 }}>
            <Text style={styles.songTitle}>{info.title}</Text>
            <Text style={styles.artistName}>{info.artist}</Text>
        </View>
    );
}

export default Header;

const styles = StyleSheet.create({
    songTitle: {
        fontSize: 20,
        marginTop: 20,
        fontWeight: 'bold',
        color: 'black'
    },
    artistName: {
        fontSize: 16,
        color: 'black',
        fontWeight: "500",
    },
});
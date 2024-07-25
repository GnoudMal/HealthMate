import Slider from "@react-native-community/slider";
import { StyleSheet, Text, View } from "react-native";
import { useProgress } from "react-native-track-player";

function TrackProgress() {
    const { position, duration } = useProgress(200);
    function format(seconds) {
        let mins = (parseInt(seconds / 60)).toString().padStart(2, '0');
        let secs = (Math.trunc(seconds) % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    console.log(format(position));
    console.log(duration);

    return (
        <View style={{ alignItems: 'center' }}>
            <Text style={styles.trackProgress}>
                {format(position)} / {format(duration)}
            </Text>
            <Slider
                style={{ width: 200, height: 40 }}
                minimumValue={0}
                maximumValue={duration}
                minimumTrackTintColor="blue"
                maximumTrackTintColor="red"
                value={position}
            />
        </View>
    );
}

export default TrackProgress;

const styles = StyleSheet.create({
    trackProgress: {
        marginTop: 40,
        textAlign: 'center',
        fontSize: 24,
        color: 'black'
    },
});


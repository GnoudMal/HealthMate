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

    // console.log(format(position));
    // console.log(duration);

    return (
        <View style={{ alignItems: 'center', justifyContent: "center", flexDirection: "row" }}>
            <Text style={styles.trackProgress}>
                {format(position)}
            </Text>
            <Slider
                style={{ width: 250 }}

                minimumValue={0}
                maximumValue={duration}
                minimumTrackTintColor="#FC9CB5"
                thumbTintColor="#FFFFFF"

                maximumTrackTintColor="#393636"
                value={position}
            />
            <Text style={styles.trackProgress}>
                {format(duration)}
            </Text>
        </View>
    );
}

export default TrackProgress;

const styles = StyleSheet.create({
    trackProgress: {
        // marginTop: 10,
        textAlign: 'center',
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '700',
    },
});


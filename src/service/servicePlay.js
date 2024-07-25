import TrackPlayer, {
    AppKilledPlaybackBehavior,
    Capability,
    RepeatMode,
    Event
} from 'react-native-track-player';

export async function setupPlayer() {
    let isSetup = false;
    try {
        await TrackPlayer.getCurrentTrack();
        isSetup = true;
    }
    catch {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
            android: {
                appKilledPlaybackBehavior:
                    AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
            },
            capabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
                Capability.SkipToPrevious,
                Capability.SeekTo,
            ],
            compactCapabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
            ],
            progressUpdateEventInterval: 2,
        });
        isSetup = true;
    }
    finally {
        return isSetup;
    }
}
export async function addTracks() {
    await TrackPlayer.add([
        {
            id: '0',
            url: 'https://cdn.pixabay.com/audio/2022/10/18/audio_31c2730e64.mp3',
            title: 'Password Infinity',
            artist: 'zezo.dev',
        },
        {
            id: '1',
            url: 'https://www.w3schools.com/tags/horse.mp3',
            title: 'horse',
            artist: 'zezo.dev',
        }, {
            id: '2',
            url: require('../music/nhacTre.mp3'),
            title: 'SPS',
            artist: 'LTD',
        }
    ]);
    await TrackPlayer.setRepeatMode(RepeatMode.Queue);
}
export async function playbackService() {
    // Hàm này để sau khai báo các event điều khiển
    TrackPlayer.addEventListener(Event.RemotePause, () => {
        console.log('Event.RemotePause');
        TrackPlayer.pause();
    });
    TrackPlayer.addEventListener(Event.RemotePlay, () => {
        console.log('Event.RemotePlay');
        TrackPlayer.play();
    });
    TrackPlayer.addEventListener(Event.RemoteNext, () => {
        console.log('Event.RemoteNext');
        TrackPlayer.skipToNext();
    });
    TrackPlayer.addEventListener(Event.RemotePrevious, () => {
        console.log('Event.RemotePrevious');
        TrackPlayer.skipToPrevious();
    });
}
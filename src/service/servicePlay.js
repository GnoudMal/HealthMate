import TrackPlayer, {
    AppKilledPlaybackBehavior,
    Capability,
    Event
} from 'react-native-track-player';
import { fetchTracksFromFirebase } from './firebaseService';

export async function setupPlayer() {
    let isSetup = false;
    try {
        await TrackPlayer.getCurrentTrack();
        isSetup = true;
    } catch {
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
    } finally {
        return isSetup;
    }
}

export async function addTracks() {
    const tracksFromFirebase = await fetchTracksFromFirebase();

    if (tracksFromFirebase.length === 0) {
        console.log('No tracks to add.');
    }

    try {
        // Lưu trữ các bài nhạc preload
        const preloadedTracks = [
            {
                id: 'ex1',
                url: 'https://a128-z3.zmdcdn.me/5734ce7b87678872801d6008a6e13003?authen=exp=1722164038~acl=/5734ce7b87678872801d6008a6e13003/*~hmac=a7784073fc26f6e51ce92ecf90b1fd4d',
                title: 'Track 1',
                artist: 'Artist 1',
            },
            {
                id: 'ex2',
                url: 'https://a128-z3.zmdcdn.me/f7e0fbbd9c317640bbffde7bf93e6d56?authen=exp=1722164405~acl=/f7e0fbbd9c317640bbffde7bf93e6d56/*~hmac=5053aaf551d7d80fa22aae5c8a1242c0',
                title: 'Track 2',
                artist: 'Artist 2',
            },
        ];

        // Xóa toàn bộ hàng đợi bài hát hiện tại
        await TrackPlayer.reset();

        // Thêm các bài nhạc preload vào hàng đợi
        await TrackPlayer.add(preloadedTracks);

        // Thêm các bài nhạc mới từ Firebase vào hàng đợi
        if (tracksFromFirebase.length > 0) {
            await TrackPlayer.add(tracksFromFirebase);
        }

        console.log('Tracks added successfully.');
    } catch (error) {
        console.error('Error adding tracks:', error);
    }
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
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
                url: 'https://a128-z3.zmdcdn.me/f7e0fbbd9c317640bbffde7bf93e6d56?authen=exp=1722350117~acl=/f7e0fbbd9c317640bbffde7bf93e6d56/*~hmac=8fc63a1805484671c8374c4ff404553d',
                title: 'Track 1',
                artist: 'Artist 1',
                imageUri: 'https://tranhgotreotuong.com/wp-content/uploads/2019/08/Ch%E1%BB%AF-T%C3%A2m-trong-th%C6%B0-ph%C3%A1p-th%E1%BB%83-hi%E1%BB%87n-%E1%BB%9F-gi%C3%A1-tr%E1%BB%8B-ngh%E1%BB%87-thu%E1%BA%ADt.jpg'
            },
            {
                id: 'ex2',
                url: 'https://a128-z3.zmdcdn.me/9dc296f484896ea8c460f1f82100c933?authen=exp=1722350982~acl=/9dc296f484896ea8c460f1f82100c933/*~hmac=00215465349012b493de90c066d97c88',
                title: 'Track 2',
                artist: 'Artist 2',
                imageUri: 'https://tranhgotreotuong.com/wp-content/uploads/2019/08/Ch%E1%BB%AF-T%C3%A2m-trong-th%C6%B0-ph%C3%A1p-th%E1%BB%83-hi%E1%BB%87n-%E1%BB%9F-gi%C3%A1-tr%E1%BB%8B-ngh%E1%BB%87-thu%E1%BA%ADt.jpg'
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
// service/firebaseService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

export async function fetchTracksFromFirebase() {
    try {
        const snapshot = await firestore().collection('tracks').get();
        const tracks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        // console.log('datacheck', tracks);
        return tracks;
    } catch (error) {
        console.error('Error fetching tracks from Firebase:', error);
        throw error;
    }
}

const videosCollection = firestore().collection('videos');

// Thêm video mới vào Firestore
export const addVideo = async (video) => {
    try {
        await videosCollection.add(video);
        console.log('Video added successfully');
    } catch (error) {
        console.error('Error adding video:', error);
    }
};

// Lấy danh sách video từ Firestore
export const fetchVideos = async (userId) => {
    try {

        const snapshot = await videosCollection.where('userId', '==', userId).get();;
        const videos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return videos;
    } catch (error) {
        console.error('Error fetching videos:', error);
        return [];
    }
};

export const fetchVideosByType = async (userId, type) => {
    try {
        const snapshot = await videosCollection
            .where('userId', '==', userId)
            .where('type', '==', type)
            .get();
        const videos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return videos;
    } catch (error) {
        console.error('Error fetching videos by type:', error);
        return [];
    }
};

export const saveExpertiseFields = async (fields) => {
    try {
        const userId = await AsyncStorage.getItem('userId');
        // Lưu các lĩnh vực tư vấn vào Firestore
        await firestore().collection('Users').doc(userId).update({
            expertiseFields: fields
        });
        console.log('Expertise fields updated successfully');
    } catch (error) {
        console.error('Error updating expertise fields:', error);
    }
};



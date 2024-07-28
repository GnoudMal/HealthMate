import { createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';

// Fetch steps from Firestore
const convertTimestamp = (timestamp) => {
    return timestamp ? new Date(timestamp.seconds * 1000).toISOString() : null;
};
const convertDateToFirestoreTimestamp = (date) => {
    const timestamp = new Date(date).getTime();
    return firestore.Timestamp.fromMillis(timestamp);
};

export const fetchSteps = createAsyncThunk('steps/fetchSteps', async (userId) => {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const startTimestamp = convertDateToFirestoreTimestamp(startOfDay);
    console.log('time', startTimestamp);
    const endTimestamp = convertDateToFirestoreTimestamp(endOfDay);

    const snapshot = await firestore().collection('steps')
        .where('userId', '==', userId)
        .where('timestamp', '>=', startTimestamp)
        .where('timestamp', '<=', endTimestamp)
        .get();



    console.log(userId);
    const stepsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            timestamp: convertTimestamp(data.timestamp),
        };
    });
    console.log('Fetched steps data:', stepsData);
    return stepsData;
});
// Add steps to Firestore
export const addStepsToFirestore = createAsyncThunk('steps/addStepsToFirestore', async ({ steps, id_user }) => {
    const newStep = await firestore().collection('steps').add({ steps, id_user, timestamp: new Date() });
    return { id: newStep.id, steps, id_user, timestamp: new Date() };
});

// Delete steps from Firestore
export const deleteStepsFromFirestore = createAsyncThunk('steps/deleteStepsFromFirestore', async ({ id, id_user }) => {
    await firestore().collection('steps').doc(id).delete();
    return { id, id_user };
});

// Update steps in Firestore
export const updateStepsInFirestore = createAsyncThunk('steps/updateStepsInFirestore', async ({ id, updatedSteps }) => {
    await firestore().collection('steps').doc(id).update(updatedSteps);
    return { id, updatedSteps };
});

export const updateSteps = createAsyncThunk(
    'steps/updateSteps',
    async ({ userId, newSteps }) => {
        // console.log(userId);
        const currentDate = new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại (YYYY-MM-DD)
        const stepsRef = firestore().collection('steps').doc(userId + '_' + currentDate);

        // Lấy tài liệu hiện tại (nếu có)
        const doc = await stepsRef.get();
        console.log('check doc', doc);

        if (doc.exists) {
            // Nếu tài liệu tồn tại, cập nhật tổng số bước
            const existingData = doc.data();
            const updatedSteps = existingData.steps + newSteps; // Cộng dồn số bước mới vào số bước cũ

            await stepsRef.update({
                steps: updatedSteps,
                timestamp: new Date(),
            });

            console.log('check update steptrack', updatedSteps);

            return { userId, steps: updatedSteps }; // Trả về số bước đã cập nhật
        } else {
            // Nếu tài liệu không tồn tại, tạo mới với số bước hiện tại
            await stepsRef.set({
                userId,
                steps: newSteps,
                timestamp: new Date(),
            });

            console.log(updatedSteps);

            return { userId, steps: newSteps }; // Trả về số bước mới
        }
    }
);
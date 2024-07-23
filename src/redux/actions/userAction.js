import { createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';

export const fetchUserInfo = createAsyncThunk('user/fetchUserInfo', async (userId) => {
    const userDoc = await firestore().collection('Users').doc(userId).get();
    if (!userDoc.exists) {
        throw new Error('User not found');
        console.log('dm ko tim thay');
    }
    return { id: userDoc.id, ...userDoc.data() };
});


export const updateUserInfo = createAsyncThunk('user/updateUserInfo', async ({ id, updateUser }) => {
    // Update the user document in Firestore
    console.log('alo', updateUser);
    await firestore().collection('Users').doc(id).update(updateUser);


    // Fetch the updated user document to return the new data
    const updatedUserDoc = await firestore().collection('Users').doc(id).get();
    return { id: updatedUserDoc.id, ...updatedUserDoc.data() };
});

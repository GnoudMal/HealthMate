import { createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';


export const fetchEntries = createAsyncThunk('gratitude/fetchEntries', async (id_user) => {
    const snapshot = await firestore().collection('gratitudeEntries').where('id_user', '==', id_user).get();
    const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return entries;
});

export const addEntryToFirestore = createAsyncThunk('gratitude/addEntryToFirestore', async ({ entry, id_user }) => {
    const newEntry = await firestore().collection('gratitudeEntries').add({ ...entry, id_user });
    return { id: newEntry.id, ...entry, id_user };
});

export const deleteEntryFromFirestore = createAsyncThunk('gratitude/deleteEntryFromFirestore', async ({ id, id_user }) => {
    await firestore().collection('gratitudeEntries').doc(id).delete();
    return { id, id_user };
});

export const updateEntryInFirestore = createAsyncThunk('gratitude/updateEntryInFirestore', async ({ id, updatedEntry }) => {
    await firestore().collection('gratitudeEntries').doc(id).update(updatedEntry);
    return { id, updatedEntry };
});
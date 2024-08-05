import { createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';


export const fetchEntries = createAsyncThunk('gratitude/fetchEntries', async (id_user) => {
    const snapshot = await firestore().collection('gratitudeEntries').where('id_user', '==', id_user).get();
    const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return entries;
});

export const addEntryToFirestore = createAsyncThunk('gratitude/addEntryToFirestore', async ({ entry, id_user }) => {
    console.log('check press', entry);

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
export const addSharedEntryToFirestore = createAsyncThunk('gratitude/addSharedEntryToFirestore', async ({ entry, id_user }) => {
    console.log('test share', { ...entry } + ' ' + id_user);

    const sharedEntry = await firestore().collection('sharedEntries').add({ ...entry, id_user });
    return { id: sharedEntry.id, ...entry, id_user };
});

export const fetchSharedEntries = createAsyncThunk(
    'gratitude/fetchSharedEntries',
    async ({ userId, friends }, { rejectWithValue }) => {
        console.log('o vcl');
        try {
            const snapshot = await firestore()
                .collection('sharedEntries')
                .where('id_user', 'in', [...friends, userId])
                .get();

            const entries = snapshot.docs.map(doc => ({
                docId: doc.id, // Lưu trữ document ID từ Firestore
                ...doc.data(),
            }));

            return entries;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


// export const deleteSharedEntryFromFirestore = createAsyncThunk('gratitude/deleteSharedEntryFromFirestore', async (id) => {
//     await firestore().collection('sharedEntries').doc(id).delete();
//     console.log('check id', id);

//     return id;
// });

export const deleteSharedEntryFromFirestore = createAsyncThunk(
    'gratitude/deleteSharedEntryFromFirestore',
    async (docId, { rejectWithValue }) => {
        try {
            await firestore().collection('sharedEntries').doc(docId).delete();
            return docId;
        } catch (error) {
            console.error('Failed to delete entry from Firestore', error);
            return rejectWithValue(error.message);
        }
    }
);

export const toggleLikeEntry = createAsyncThunk(
    'gratitude/toggleLikeEntry',
    async ({ docId, userId }, { rejectWithValue }) => {
        try {
            console.log('check bai', docId + " " + userId);

            const entryRef = firestore().collection('sharedEntries').doc(docId);
            const doc = await entryRef.get();
            if (!doc.exists) throw new Error('Document not found');

            const data = doc.data();
            const likes = data.likes || [];
            const userAlreadyLiked = likes.includes(userId);




            if (userAlreadyLiked) {
                await entryRef.update({
                    likes: firestore.FieldValue.arrayRemove(userId)
                });
            } else {
                await entryRef.update({
                    likes: firestore.FieldValue.arrayUnion(userId)
                });
            }
            console.log();

            return { docId, userId };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


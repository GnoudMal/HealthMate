import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';

// Fetch Tracks
export const fetchTracks = createAsyncThunk(
    'tracks/fetchTracks',
    async ({ userId }) => {
        try {
            const snapshot = await firestore()
                .collection('tracks')
                .where('userId', '==', userId)
                .get();
            const tracks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('check log', tracks);
            return tracks;
        } catch (error) {
            console.log('da vang khoi track');
            return { error: error.message };
        }
    }
);

// Add Track to Firebase
export const addTrackToFirebase = createAsyncThunk(
    'tracks/addTrackToFirebase',
    async ({ track, userId }, { rejectWithValue }) => {
        const trackWithUserId = { ...track, userId };
        try {
            const newTrack = await firestore().collection('tracks').add(trackWithUserId);
            return { id: newTrack.id, ...trackWithUserId };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const tracksSlice = createSlice({
    name: 'track',
    initialState: {
        tracks: [],
        error: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTracks.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTracks.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.tracks = action.payload;
                state.error = null;
            })
            .addCase(fetchTracks.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(addTrackToFirebase.fulfilled, (state, action) => {
                state.tracks.push(action.payload);
                state.error = null;
            });
    },
});

export const { actions, reducer } = tracksSlice;
export default reducer;

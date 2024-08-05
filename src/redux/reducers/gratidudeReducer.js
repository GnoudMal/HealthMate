import { createSlice } from '@reduxjs/toolkit';
import {
    fetchEntries,
    addEntryToFirestore,
    deleteEntryFromFirestore,
    updateEntryInFirestore,
    addSharedEntryToFirestore,
    fetchSharedEntries,
    deleteSharedEntryFromFirestore,
    toggleLikeEntry
} from '../actions/gratitudeActions';

const gratitudeSlice = createSlice({
    name: 'gratitude',
    initialState: {
        entries: [],
        sharedEntries: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchEntries.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchEntries.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.entries = action.payload;
            })
            .addCase(fetchEntries.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(addEntryToFirestore.fulfilled, (state, action) => {
                state.entries.push(action.payload);
            })
            .addCase(deleteEntryFromFirestore.fulfilled, (state, action) => {
                state.entries = state.entries.filter(entry => entry.id !== action.payload.id);
            })
            .addCase(updateEntryInFirestore.fulfilled, (state, action) => {
                const index = state.entries.findIndex(entry => entry.id === action.payload.id);
                if (index !== -1) {
                    state.entries[index] = action.payload;
                }
            })
            .addCase(addSharedEntryToFirestore.fulfilled, (state, action) => {
                state.sharedEntries.push(action.payload);
            })
            .addCase(fetchSharedEntries.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSharedEntries.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.sharedEntries = action.payload;
            })
            .addCase(fetchSharedEntries.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(deleteSharedEntryFromFirestore.fulfilled, (state, action) => {
                state.sharedEntries = state.sharedEntries.filter(entry => entry.docId !== action.payload);
            })
            .addCase(toggleLikeEntry.fulfilled, (state, action) => {
                const { docId, userId } = action.payload;
                const entry = state.sharedEntries.find(entry => entry.docId === docId);
                if (entry) {
                    const userAlreadyLiked = entry.likes.includes(userId);
                    if (userAlreadyLiked) {
                        entry.likes = entry.likes.filter(id => id !== userId);
                    } else {
                        entry.likes.push(userId);
                    }
                }
            })
            .addCase(toggleLikeEntry.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});


export default gratitudeSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';
import { fetchEntries, addEntryToFirestore, deleteEntryFromFirestore, updateEntryInFirestore } from '../actions/gratitudeActions';

const gratitudeSlice = createSlice({
    name: 'gratitude',
    initialState: {
        entries: [],
        error: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
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
                state.error = action.error.message;
            })
            .addCase(addEntryToFirestore.fulfilled, (state, action) => {
                state.entries.push(action.payload);
            })
            .addCase(deleteEntryFromFirestore.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteEntryFromFirestore.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.entries = state.entries.filter(entry => entry.id !== action.payload.id);
            })
            .addCase(deleteEntryFromFirestore.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(updateEntryInFirestore.fulfilled, (state, action) => {
                const { id, updatedEntry } = action.payload;
                state.entries = state.entries.map(entry =>
                    entry.id === id ? { ...entry, ...updatedEntry } : entry
                );
            });

    },
});

export default gratitudeSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';
import { fetchGoals, addGoalToFirestore, deleteGoalFromFirestore, updateGoalInFirestore } from '../actions/goalActions';

const goalSlice = createSlice({
    name: 'goal',
    initialState: {
        goals: [],
        error: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchGoals.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchGoals.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.goals = action.payload;
            })
            .addCase(fetchGoals.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(addGoalToFirestore.fulfilled, (state, action) => {
                state.goals.push(action.payload);
            });
    },
});

export default goalSlice.reducer;

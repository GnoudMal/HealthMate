import { createSlice } from '@reduxjs/toolkit';
import { fetchGoals, addGoalToFirestore, deleteGoalFromFirestore, updateGoalInFirestore, updateGoal } from '../actions/GoalActions';

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
            })
            .addCase(updateGoal.fulfilled, (state, action) => {
                // Cập nhật mục tiêu trong mảng `goals` dựa trên ID
                state.goals = state.goals.map(goal =>
                    goal.id === action.payload.id ? action.payload : goal
                );
                state.status = 'succeeded';
            });
    },
});

export default goalSlice.reducer;

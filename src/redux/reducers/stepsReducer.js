import { createSlice } from '@reduxjs/toolkit';
import { fetchSteps, addStepsToFirestore, deleteStepsFromFirestore, updateStepsInFirestore, updateSteps, fetchStepsForMonth } from '../actions/stepActions';

const stepSlice = createSlice({
    name: 'steps',
    initialState: {
        steps: 0,
        monthlySteps: [],
        error: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSteps.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSteps.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Cập nhật số bước tại đây
                state.steps = action.payload.length > 0 ? action.payload[0].steps : 0;
            })
            .addCase(fetchSteps.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(addStepsToFirestore.fulfilled, (state, action) => {
                // Giả sử action.payload chứa số bước mới
                state.steps = action.payload.steps;
            })
            .addCase(deleteStepsFromFirestore.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteStepsFromFirestore.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Nếu bạn cần xử lý cập nhật số bước sau khi xóa, bạn có thể thêm logic ở đây
            })
            .addCase(deleteStepsFromFirestore.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(updateStepsInFirestore.fulfilled, (state, action) => {
                const { updatedSteps } = action.payload;
                state.steps = updatedSteps;
            }).
            addCase(updateSteps.fulfilled, (state, action) => {
                state.steps = action.payload.steps; // Nếu payload chứa `steps`
            }).
            addCase(fetchStepsForMonth.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchStepsForMonth.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.monthlySteps = action.payload; // Update state with monthly steps
                console.log('Cập nhật stepsForMonth trong slice:', state.monthlySteps);
            })
            .addCase(fetchStepsForMonth.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default stepSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';
import { fetchConsultants, addNewConsultant, removeConsultant, updateExistingConsultant } from '../actions/ConsultantsActions';

const initialState = {
    list: [],
    status: 'idle',
    error: null,
    adding: false,
    updating: false,
    deleting: false,
};

const consultantsSlice = createSlice({
    name: 'consultants',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchConsultants.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchConsultants.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = action.payload;
            })
            .addCase(fetchConsultants.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(addNewConsultant.pending, (state) => {
                state.adding = true;
            })
            .addCase(addNewConsultant.fulfilled, (state, action) => {
                state.adding = false;
                state.list.push(action.payload);
            })
            .addCase(addNewConsultant.rejected, (state, action) => {
                state.adding = false;
                state.error = action.error.message;
            })
            .addCase(removeConsultant.pending, (state) => {
                state.deleting = true;
            })
            .addCase(removeConsultant.fulfilled, (state, action) => {
                state.deleting = false;
                state.list = state.list.filter(consultant => consultant.id !== action.payload);
            })
            .addCase(removeConsultant.rejected, (state, action) => {
                state.deleting = false;
                state.error = action.error.message;
            })
            .addCase(updateExistingConsultant.pending, (state) => {
                state.updating = true;
            })
            .addCase(updateExistingConsultant.fulfilled, (state, action) => {
                state.updating = false;
                const { id, name } = action.payload;
                const existingConsultant = state.list.find(consultant => consultant.id === id);
                if (existingConsultant) {
                    existingConsultant.name = name;
                }
            })
            .addCase(updateExistingConsultant.rejected, (state, action) => {
                state.updating = false;
                state.error = action.error.message;
            });
    },
});

export const { addConsultant, updateConsultant, deleteConsultant, setStatus, setError, setAdding, setUpdating, setDeleting } = consultantsSlice.actions;

export default consultantsSlice.reducer;


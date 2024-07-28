import { createSlice } from '@reduxjs/toolkit';
import { fetchUserInfo, updateUserInfo } from '../actions/userAction';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        userInfo: null,
        id: null,
        loading: false,
        error: null,
    },
    reducers: {
        setUserId(state, action) {
            state.id = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserInfo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserInfo.fulfilled, (state, action) => {
                state.loading = false;
                state.userInfo = action.payload;
            })
            .addCase(fetchUserInfo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(updateUserInfo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserInfo.fulfilled, (state, action) => {
                state.loading = false;
                if (state.userInfo && state.userInfo.id === action.payload.id) {
                    state.userInfo = { ...state.userInfo, ...action.payload };
                }
            })
            .addCase(updateUserInfo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const { setUserId } = userSlice.actions;
export const userReducer = userSlice.reducer;
export default userReducer;

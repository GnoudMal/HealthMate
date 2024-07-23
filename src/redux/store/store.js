import { configureStore } from '@reduxjs/toolkit';
import gratitudeReducer from '../reducers/gratidudeReducer';
import { userReducer } from '../reducers/userReducer';

const store = configureStore({
    reducer: {
        gratitude: gratitudeReducer,
        user: userReducer,
    },
});

export default store;

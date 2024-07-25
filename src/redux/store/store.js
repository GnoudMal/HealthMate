import { configureStore } from '@reduxjs/toolkit';
import gratitudeReducer from '../reducers/gratidudeReducer';
import { userReducer } from '../reducers/userReducer';
import stepsReducer from '../reducers/stepsReducer';
import goalReducer from '../reducers/goalReducer';

const store = configureStore({
    reducer: {
        gratitude: gratitudeReducer,
        user: userReducer,
        steps: stepsReducer,
        goal: goalReducer
    },
});

export default store;

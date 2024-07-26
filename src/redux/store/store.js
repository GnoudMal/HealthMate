import { configureStore } from '@reduxjs/toolkit';
import gratitudeReducer from '../reducers/gratidudeReducer';
import { userReducer } from '../reducers/userReducer';
import stepsReducer from '../reducers/stepsReducer';
import goalReducer from '../reducers/goalReducer';
import trackReducer from '../reducers/trackReducer';

const store = configureStore({
    reducer: {
        gratitude: gratitudeReducer,
        user: userReducer,
        steps: stepsReducer,
        goal: goalReducer,
        track: trackReducer
    },
});

export default store;

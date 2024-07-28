import { configureStore } from '@reduxjs/toolkit';
import gratitudeReducer from '../reducers/gratidudeReducer';
import stepsReducer from '../reducers/stepsReducer';
import goalReducer from '../reducers/goalReducer';
import trackReducer from '../reducers/trackReducer';
import userReducer from '../reducers/userReducer';
import ConsultantReducer from '../reducers/ConsultantReducer';

const store = configureStore({
    reducer: {
        gratitude: gratitudeReducer,
        user: userReducer,
        steps: stepsReducer,
        goal: goalReducer,
        track: trackReducer,
        consultants: ConsultantReducer,
    },
});

export default store;

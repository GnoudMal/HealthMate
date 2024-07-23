import { createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';


export const fetchGoals = createAsyncThunk('goal/fetchGoals', async (id_user) => {
    const snapshot = await firestore().collection('Goal').where('id_user', '==', id_user).get();
    const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return goals;
});

export const addGoalToFirestore = createAsyncThunk('goal/addGoalToFirestore', async ({ goal, id_user }) => {
    console.log('Dữ liệu gửi lên:', { ...goal, id_user });
    const newGoal = await firestore().collection('Goal').add({ ...goal, id_user });
    return { id: newGoal.id, ...goal, id_user };
});

export const fetchGoalById = createAsyncThunk('goal/fetchGoalById', async ({ id, id_user }) => {
    const doc = await firestore().collection('Goal').doc(id).get();
    if (!doc.exists) {
        throw new Error('Goal not found');
    }
    return { id: doc.id, ...doc.data(), id_user };
});

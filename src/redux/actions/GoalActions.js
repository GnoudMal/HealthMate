import { createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';


export const fetchGoals = createAsyncThunk('goal/fetchGoals', async (id_user) => {
    console.log('check id', id_user);

    const snapshot = await firestore().collection('Goal').where('id_user', '==', id_user).get();
    const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('da o day', goals);
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

export const updateGoal = createAsyncThunk('goal/updateGoal', async ({ id_user, newGoal }) => {
    try {
        const goalsRef = firestore().collection('Goal');
        console.log('checkfour', id_user);
        console.log(newGoal.chức_năng);
        // Kiểm tra sự tồn tại của mục tiêu dựa vào userId và chức năng
        const snapshot = await goalsRef.where('id_user', '==', id_user)
            .where('chức_năng', '==', newGoal.chức_năng)
            .get();

        if (!snapshot.empty) {
            // Nếu đã tồn tại mục tiêu, cập nhật mục tiêu đầu tiên tìm thấy
            const docId = snapshot.docs[0].id;
            await goalsRef.doc(docId).update(newGoal);

            // Lấy dữ liệu mục tiêu đã cập nhật
            const updatedGoalDoc = await goalsRef.doc(docId).get();
            if (!updatedGoalDoc.exists) {
                throw new Error('Goal update failed, document not found');
            }
            return { id: updatedGoalDoc.id, ...updatedGoalDoc.data() };
        } else {
            // Nếu không tồn tại mục tiêu, thêm mới mục tiêu
            const newGoalDoc = await goalsRef.add({ ...newGoal, id_user });
            return { id: newGoalDoc.id, ...newGoal, id_user };
        }
    } catch (error) {
        console.error('Error updating or adding goal:', error);
        throw error;
    }
});
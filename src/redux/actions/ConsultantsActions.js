import { createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';


export const fetchConsultants = createAsyncThunk('consultants/fetchConsultants', async () => {
    try {
        const snapshot = await firestore().collection('Users').where('role', '==', 'consultant').get();
        const consultants = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log('duoc goi');
        return consultants;
    } catch (error) {
        throw new Error(error.message);
    }
});

export const addNewConsultant = createAsyncThunk('consultants/addNewConsultant', async (newConsultantData, { dispatch }) => {
    const { name, email, password } = newConsultantData;

    try {
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        const currentUser = auth().currentUser;

        const userDocRef = await firestore().collection('Users').doc(user.uid).set({
            uid: user.uid,
            email: email,
            name: name,
            role: 'consultant',
        });

        const newConsultant = {
            id: user.uid,
            name: name,
            email: email,
            expertise: expertise,
        };

        if (currentUser) {
            await auth().signInWithEmailAndPassword(currentUser.email, currentUser.password);
        }

        return newConsultant;
    } catch (error) {
        throw new Error(error.message);
    }
});

export const updateExistingConsultant = createAsyncThunk('consultants/updateExistingConsultant', async (updatedConsultantData, { dispatch }) => {
    const { id, name } = updatedConsultantData;

    try {
        await firestore().collection('Users').doc(id).update({ name });

        // Cập nhật state
        dispatch(updateConsultant(updatedConsultantData));

        return updatedConsultantData;
    } catch (error) {
        throw new Error(error.message);
    }
});

export const removeConsultant = createAsyncThunk('consultants/removeConsultant', async (id, { dispatch }) => {
    try {
        // Xóa consultant khỏi Firestore
        await firestore().collection('Users').doc(id).delete();

        // Cập nhật state
        dispatch(deleteConsultant(id));

        return id;
    } catch (error) {
        throw new Error(error.message);
    }
});

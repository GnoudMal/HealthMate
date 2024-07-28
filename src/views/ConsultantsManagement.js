import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { addNewConsultant, fetchConsultants, removeConsultant, updateExistingConsultant } from '../redux/actions/ConsultantsActions';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const ConsultantsManagementScreen = () => {
    const [field, setField] = useState('');
    const [newConsultantName, setNewConsultantName] = useState('');
    const [newConsultantEmail, setNewConsultantEmail] = useState('');
    const [newConsultantPassword, setNewConsultantPassword] = useState('');
    const [newConsultantExpertise, setNewConsultantExpertise] = useState('');

    const [editingConsultant, setEditingConsultant] = useState(null);
    const [editName, setEditName] = useState('');

    const dispatch = useDispatch();
    const consultants = useSelector(state => state.consultants.list);
    const status = useSelector(state => state.consultants.status);
    const navigation = useNavigation();

    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        dispatch(fetchConsultants());
    }, [dispatch]);

    const handleAddConsultant = () => {
        if (!newConsultantName.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }
        if (!newConsultantEmail.trim()) {
            Alert.alert('Error', 'Email is required');
            return;
        }
        if (!newConsultantPassword.trim()) {
            Alert.alert('Error', 'Password is required');
            return;
        }
        // Optional: validate email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(newConsultantEmail)) {
            Alert.alert('Error', 'Invalid email format');
            return;
        }
        dispatch(addNewConsultant({
            name: newConsultantName,
            email: newConsultantEmail,
            password: newConsultantPassword,
            expertise: field,
        })).then(() => dispatch(fetchConsultants()))
            .catch(error => Alert.alert('Error', error.message));

        setNewConsultantName('');
        setNewConsultantEmail('');
        setNewConsultantPassword('');
        // setNewConsultantExpertise('');
        setField('');
        setModalVisible(false);
    };

    const handleEditConsultant = (id, name) => {
        setEditingConsultant(id);
        setEditName(name);
    };

    const handleSaveEdit = () => {
        if (editName.trim()) {
            dispatch(updateExistingConsultant({ id: editingConsultant, name: editName }))
                .then(() => dispatch(fetchConsultants()))
                .catch(error => Alert.alert('Error', error.message));
            setEditingConsultant(null);
            setEditName('');
        } else {
            Alert.alert('Error', 'Consultant name cannot be empty');
        }
    };

    const handleDeleteConsultant = (id) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this consultant?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'OK',
                    onPress: () => dispatch(removeConsultant(id))
                        .then(() => dispatch(fetchConsultants()))
                        .catch(error => Alert.alert('Error', error.message))
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Consultants Management</Text>
            </View>

            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.openModalButton}>
                <Text style={styles.openModalButtonText}>Add New Consultant</Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TextInput
                            style={styles.input}
                            placeholder="Name"
                            value={newConsultantName}
                            onChangeText={setNewConsultantName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={newConsultantEmail}
                            onChangeText={setNewConsultantEmail}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            secureTextEntry
                            value={newConsultantPassword}
                            onChangeText={setNewConsultantPassword}
                        />
                        <Picker selectedValue={field} onValueChange={(itemValue) => setField(itemValue)}>
                            <Picker.Item label="Tài chính" value="finance" />
                            <Picker.Item label="Sức khỏe" value="health" />
                        </Picker>
                        {/* <TextInput
                            style={styles.input}
                            placeholder="Expertise"
                            value={newConsultantExpertise}
                            onChangeText={setNewConsultantExpertise}
                        /> */}
                        <TouchableOpacity onPress={handleAddConsultant} style={styles.addButton}>
                            <Text style={styles.addButtonText}>Add Consultant</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {status === 'loading' ? (
                <ActivityIndicator size="large" color="#4e9bde" style={styles.loading} />
            ) : (
                <FlatList
                    data={consultants}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.item}>
                            {editingConsultant === item.id ? (
                                <View style={styles.editContainer}>
                                    <TextInput
                                        style={styles.input}
                                        value={editName}
                                        onChangeText={setEditName}
                                    />
                                    <TouchableOpacity onPress={handleSaveEdit} style={styles.saveButton}>
                                        <Text style={styles.saveButtonText}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    <Text style={styles.itemText}>{item.name}</Text>
                                    <View style={styles.actions}>
                                        <TouchableOpacity onPress={() => handleEditConsultant(item.id, item.name)}>
                                            <Icon name="pencil-outline" size={20} color="#4e9bde" style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteConsultant(item.id)}>
                                            <Icon name="trash-outline" size={20} color="#e74c3c" style={styles.icon} />
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    header: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: '#4e9bde',
        alignItems: 'center',
    },
    btnBack: {
        // backgroundColor: '#F7F8F8',
        borderRadius: 8,
        padding: 7,
        marginRight: 10
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    openModalButton: {
        backgroundColor: '#4e9bde',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        margin: 10,
    },
    openModalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        maxWidth: 400,
        elevation: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    addButton: {
        backgroundColor: '#4e9bde',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    closeButton: {
        backgroundColor: '#e74c3c',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        backgroundColor: '#fff',
        marginHorizontal: 10,
        marginBottom: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    itemText: {
        fontSize: 16,
    },
    actions: {
        flexDirection: 'row',
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    saveButton: {
        backgroundColor: '#4e9bde',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginLeft: 10,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        marginHorizontal: 8,
    },
});

export default ConsultantsManagementScreen;
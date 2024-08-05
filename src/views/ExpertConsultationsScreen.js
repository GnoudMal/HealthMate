import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ImageBackground, Alert, Modal, Pressable } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ExpertConsultations = () => {
    const [consultations, setConsultations] = useState({});
    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [response, setResponse] = useState('');
    const [message, setMessage] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [consultationIdToDelete, setConsultationIdToDelete] = useState(null);


    const fetchConsultations = async () => {
        try {
            const currentUser = auth().currentUser;
            const userDocument = await firestore().collection('Users').doc(currentUser.uid).get();
            const userRecent = userDocument.data();
            const expertiseFields = userRecent.expertiseFields;

            console.log('check ngnah', expertiseFields);


            if (currentUser) {
                const snapshot = await firestore().collection('consultations')
                    .where('expertId', '==', null)
                    .where('field', 'in', expertiseFields)
                    .get();

                if (snapshot.empty) {
                    setMessage('Hiện tại chưa có yêu cầu nào.');
                } else {
                    const fetchedConsultations = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    // Nhóm các yêu cầu tư vấn theo lĩnh vực
                    const groupedConsultations = fetchedConsultations.reduce((acc, consultation) => {
                        const field = consultation.field;
                        if (!acc[field]) {
                            acc[field] = [];
                        }
                        acc[field].push(consultation);
                        return acc;
                    }, {});

                    setConsultations(groupedConsultations);
                }
            }
        } catch (error) {
            setMessage('Có lỗi xảy ra khi tải yêu cầu.');
            console.log(error);

        }
    };

    useEffect(() => {
        fetchConsultations();
    }, [consultations]);

    const handleComplete = async (id) => {
        try {
            await firestore().collection('consultations').doc(id).update({
                status: 'completed'
            });
            Alert.alert('Thông báo', 'Yêu cầu đã được đánh dấu hoàn thành.');
            fetchConsultations();
        } catch (error) {
            setMessage('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    };

    const handleDelete = (id) => {
        setConsultationIdToDelete(id);
        setModalVisible(true);
    };

    const confirmDelete = async () => {
        try {
            await firestore().collection('consultations').doc(consultationIdToDelete).delete();
            setModalVisible(false);
            Alert.alert('Thông báo', 'Yêu cầu đã được xóa.');
            fetchConsultations();
        } catch (error) {
            setModalVisible(false);
            setMessage('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    };


    const handleResponseSubmit = async () => {
        if (!response || !selectedConsultation) {
            setMessage('Vui lòng nhập phản hồi và chọn yêu cầu.');
            return;
        }

        try {
            const currentUser = auth().currentUser;

            if (currentUser) {
                await firestore().collection('consultations').doc(selectedConsultation.id).update({
                    responses: firestore.FieldValue.arrayUnion({
                        expertId: currentUser.uid,
                        content: response,
                        respondedAt: firestore.FieldValue.serverTimestamp()
                    }),
                    expertId: currentUser.uid,
                    updatedAt: firestore.FieldValue.serverTimestamp()
                });

                setResponse('');
                setSelectedConsultation(null);
                setMessage('Phản hồi đã được gửi thành công.');
                fetchConsultations();
            }
        } catch (error) {
            setMessage('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    };

    const renderQuestion = ({ item }) => {
        const isCompleted = item.status === 'completed';
        // console.log('check it', item);

        const handleExpandToggle = () => {
            setIsExpanded(!isExpanded);
            setExpandedId(isExpanded ? null : item.id);
        };

        const truncateText = (text) => {
            if (isExpanded) return text;
            return text.length > 100 ? `${text.substring(0, 100)}...` : text;
        };

        return (
            <TouchableOpacity onPress={() => navigation.navigate('QuestionDetail', { questionId: item.id })} style={[styles.questionContainer, isCompleted && styles.completedQuestionContainer]}>
                <Text style={styles.questionField}>
                    <Icon name="briefcase" size={18} color="#000" /> Lĩnh Vực: {item.field}
                </Text>
                <Text style={styles.questionText}>
                    <Icon name="question-circle" size={18} color="#000" /> Nội Dung: {truncateText(item.question)}
                </Text>
                {item.question.length > 100 && (
                    <TouchableOpacity onPress={handleExpandToggle}>
                        <Text style={styles.toggleText}>
                            {isExpanded ? 'Ẩn' : 'Xem thêm'} <Icon name={isExpanded ? 'angle-up' : 'angle-down'} size={16} color="blue" />
                        </Text>
                    </TouchableOpacity>
                )}

                <View style={styles.buttonContainer}>
                    {!isCompleted && (
                        <TouchableOpacity onPress={() => handleComplete(item.id)} style={styles.completeButton}>
                            <Text style={styles.buttonText}><Icon name="check" size={16} color="#fff" /> Hoàn thành</Text>
                        </TouchableOpacity>
                    )}
                    {/* {isCompleted && (
                        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                            <Text style={styles.buttonText}><Icon name="trash" size={16} color="#fff" /> Xóa</Text>
                        </TouchableOpacity>
                    )} */}

                </View>

            </TouchableOpacity>
        );
    };

    const renderFieldGroup = ({ item }) => (
        <View style={styles.fieldGroupContainer}>
            <Text style={styles.fieldGroupTitle}>
                <Icon name="folder" size={18} color="#000" /> {item.field}
            </Text>
            <FlatList
                data={item.consultations}
                keyExtractor={(consultation) => consultation.id}
                renderItem={renderQuestion}
            />
        </View>
    );

    const groupedConsultationsData = Object.keys(consultations).map(field => ({
        field,
        consultations: consultations[field]
    }));

    return (
        <ImageBackground style={{ flex: 1 }} source={{ uri: 'https://i.pinimg.com/564x/d9/78/3d/d9783d4bafd8d5fd0cf4ef814f4f87e0.jpg' }}>
            <SafeAreaView style={styles.container}>
                {/* {message ? <Text>{message}</Text> : null} */}
                <Text style={{ fontSize: 30, textAlign: 'center', marginBottom: 20, fontWeight: 'bold' }}>
                    <Icon name="clipboard" size={30} color="#000" /> Tiếp Nhận Thông Tin
                </Text>
                <FlatList
                    data={groupedConsultationsData}
                    keyExtractor={(item) => item.field}
                    renderItem={renderFieldGroup}
                />
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Xác nhận xóa</Text>
                            <Text style={styles.modalMessage}>Bạn có chắc chắn muốn xóa yêu cầu này không?</Text>
                            <View style={styles.modalButtonContainer}>
                                <Pressable onPress={() => setModalVisible(false)} style={styles.modalButtonCancel}>
                                    <Text style={styles.modalButtonText}>Hủy</Text>
                                </Pressable>
                                <Pressable onPress={confirmDelete} style={styles.modalButtonConfirm}>
                                    <Text style={styles.modalButtonText}>Xóa</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    questionContainer: {
        marginBottom: 20,
        backgroundColor: '#DDE6C5',
        padding: 10,
        borderRadius: 10,
        borderWidth: 0.5,
        elevation: 5
    },
    questionField: {
        fontWeight: 'bold',
    },
    questionText: {
        fontWeight: '500',
        marginVertical: 10,
    },
    toggleText: {
        color: 'blue',
        marginVertical: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    completeButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
    },
    completedQuestionContainer: {
        backgroundColor: '#E0E0E0',
    },
    deleteButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    fieldGroupContainer: {
        marginBottom: 20,
    },
    fieldGroupTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalMessage: {
        fontSize: 16,
        marginBottom: 20,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    modalButtonCancel: {
        backgroundColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginRight: 5,
        alignItems: 'center',
    },
    modalButtonConfirm: {
        backgroundColor: '#f44336',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default ExpertConsultations;

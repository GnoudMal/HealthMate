import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, FlatList, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const ExpertConsultations = () => {
    const [consultations, setConsultations] = useState([]);
    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [response, setResponse] = useState('');
    const [message, setMessage] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    navigation = useNavigation();

    useEffect(() => {
        const fetchConsultations = async () => {
            try {
                const currentUser = auth().currentUser;
                const userDocument = await firestore().collection('Users').doc(currentUser.uid).get();
                const userRecent = userDocument.data();
                const expertiseFields = userRecent.expertiseFields; // Lĩnh vực chuyên gia
                console.log(expertiseFields);
                if (currentUser) {
                    const snapshot = await firestore().collection('consultations')
                        .where('expertId', '==', null) // Chuyên gia chưa nhận yêu cầu
                        .where('field', 'in', expertiseFields) // Lĩnh vực chuyên gia
                        .get();

                    if (snapshot.empty) {
                        setMessage('Hiện tại chưa có yêu cầu nào.');
                    } else {
                        const fetchedConsultations = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));

                        setConsultations(fetchedConsultations);
                    }
                }
            } catch (error) {
                setMessage('Có lỗi xảy ra khi tải yêu cầu.');
            }
        };

        fetchConsultations();
    }, []);

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
            }
        } catch (error) {
            setMessage('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    };

    const renderQuestion = ({ item }) => {


        const handleExpandToggle = () => {
            setIsExpanded(!isExpanded);
            setExpandedId(isExpanded ? null : item.id);
        };

        const truncateText = (text) => {
            if (isExpanded) return text;

            return text.length > 100 ? `${text.substring(0, 100)}...` : text;
        };

        return (
            <TouchableOpacity onPress={() => navigation.navigate('QuestionDetail', { questionId: item.id })} style={styles.questionContainer}>
                <Text style={styles.questionField}>Lĩnh Vực: {item.field}</Text>
                <Text style={styles.questionText}>Nội Dung: {truncateText(item.question)}</Text>
                {item.question.length > 100 && (
                    <TouchableOpacity onPress={handleExpandToggle}>
                        <Text style={styles.toggleText}>{isExpanded ? 'Ẩn' : 'Xem thêm'}</Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <ImageBackground style={{ flex: 1 }} source={{ uri: 'https://i.pinimg.com/564x/d9/78/3d/d9783d4bafd8d5fd0cf4ef814f4f87e0.jpg' }}>
            <SafeAreaView style={styles.container}>
                {message ? <Text>{message}</Text> : null}
                <Text style={{ fontSize: 30, textAlign: 'center', marginBottom: 10, fontWeight: 'bold' }}>Tiếp Nhận Thông Tin</Text>
                <FlatList
                    data={consultations}
                    keyExtractor={(item) => item.id}
                    renderItem={renderQuestion}
                />
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
        marginVertical: 10,
    },
    toggleText: {
        color: 'blue',
        marginVertical: 5,
    },
    textInput: {
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
    },
});

export default ExpertConsultations;

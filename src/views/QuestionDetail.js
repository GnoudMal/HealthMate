import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet, ScrollView, FlatList, Image, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { BackgroundImage } from 'react-native-elements/dist/config';

const QuestionDetail = ({ route, navigation }) => {
    const { questionId } = route.params;
    const [question, setQuestion] = useState(null);
    const [response, setResponse] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [followUpQuestion, setFollowUpQuestion] = useState('');
    const [isOwner, setIsOwner] = useState(false);
    const [isExpert, setIsExpert] = useState(false);

    useEffect(() => {
        const unsubscribe = firestore()
            .collection('consultations')
            .doc(questionId)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const questionData = doc.data();
                    setQuestion(questionData);
                    setMessages(questionData.messages || []);

                    const currentUser = auth().currentUser;
                    if (currentUser) {
                        firestore()
                            .collection('Users')
                            .doc(currentUser.uid)
                            .get()
                            .then((userDoc) => {
                                if (userDoc.exists) {
                                    const userData = userDoc.data();
                                    if (userData.role === 'admin') {
                                        setIsExpert(true);
                                    }
                                }

                                if (questionData.userId === currentUser.uid) {
                                    setIsOwner(true);
                                }
                            });
                    }
                } else {
                    setMessage('Câu hỏi không tồn tại.');
                }
            }, (error) => {
                setMessage('Có lỗi xảy ra khi tải câu hỏi.');
            });

        return () => unsubscribe();
    }, [questionId]);

    const handleFollowUpQuestionSubmit = async () => {
        if (!followUpQuestion) {
            setMessage('Vui lòng nhập câu hỏi tiếp theo.');
            return;
        }

        try {
            const currentUser = auth().currentUser;

            const timestamp = new Date();

            if (currentUser) {
                await firestore().collection('consultations').doc(questionId).update({
                    messages: firestore.FieldValue.arrayUnion({
                        userId: currentUser.uid,
                        content: followUpQuestion,
                        createdAt: timestamp,
                        type: 'followUp'
                    }),
                    updatedAt: timestamp
                });

                setFollowUpQuestion('');
                setMessage('Câu hỏi tiếp theo đã được gửi.');
            }
        } catch (error) {
            console.log(error);
            setMessage('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    };

    const handleResponseSubmit = async () => {
        if (!response) {
            setMessage('Vui lòng nhập phản hồi.');
            return;
        }

        try {
            const currentUser = auth().currentUser;

            if (currentUser) {
                const questionRef = firestore().collection('consultations').doc(questionId);

                // Tạo timestamp thủ công cho phản hồi
                const timestamp = new Date();

                await questionRef.update({
                    messages: firestore.FieldValue.arrayUnion({
                        userId: currentUser.uid,
                        content: response,
                        createdAt: timestamp, // Timestamp cho phản hồi
                        type: 'response'
                    }),
                    updatedAt: timestamp // Timestamp cho cập nhật
                });

                // Tạo một đối tượng thông báo với timestamp thủ công
                const notification = {
                    content: 'Bạn có một phản hồi mới từ chuyên gia: ' + response,
                    createdAt: timestamp.toISOString(), // Timestamp cho thông báo
                    questionId: questionId,
                };

                // Cập nhật thông báo cho người dùng
                await firestore().collection('Users').doc(question.userId).update({
                    notifications: firestore.FieldValue.arrayUnion(notification)
                });

                setResponse('');
                setMessage('Phản hồi đã được gửi thành công.');
            }
        } catch (error) {
            console.log(error);
            setMessage('Có lỗi xảy ra. Vui lòng thử lại sau.');
        }
    };




    const renderMessageItem = ({ item }) => {
        console.log('date check', item.createdAt.toLocaleString());
        const isCurrentUser = item.userId === auth().currentUser.uid;
        const containerStyle = isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer;
        const textStyle = isCurrentUser ? styles.currentUserText : styles.otherUserText;
        const timeStyle = isCurrentUser ? styles.currentUserTime : styles.otherUserTime;

        const userImage = isCurrentUser
            ? 'https://www.shareicon.net/data/128x128/2016/09/15/829459_man_512x512.png' // Placeholder or fetch from user data
            : 'https://www.shareicon.net/data/128x128/2016/09/15/829459_man_512x512.png'; // Placeholder or fetch from user data

        const createdAt = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
        const formattedDate = !isNaN(createdAt) ? createdAt.toLocaleString() : 'Invalid Date';

        return (
            <View style={[styles.messageContainer, containerStyle]}>
                {!isCurrentUser && <Image
                    source={{ uri: userImage }}
                    style={styles.userImage}
                />}
                <View style={styles.messageContent}>
                    <Text style={textStyle}>{item.content}</Text>
                    <Text style={timeStyle}>{formattedDate}</Text>
                </View>
            </View>
        );
    };

    return (
        <BackgroundImage style={{ flex: 1 }} source={{ uri: 'https://i.pinimg.com/564x/1f/21/da/1f21dac04b79e33d177b824aa7dc88f5.jpg' }}>
            <SafeAreaView style={styles.container}>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'flex-start' }}>
                    <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={28} color="black" />
                    </TouchableOpacity>
                </View>
                {message ? <Text>{message}</Text> : null}
                {question && (
                    <FlatList
                        data={messages}
                        renderItem={renderMessageItem}
                        keyExtractor={(item, index) => index.toString()}
                        ListHeaderComponent={() => (
                            <View style={{ backgroundColor: 'white', padding: 10, borderRadius: 20, width: '60%' }}>
                                <Text style={styles.questionField}>Lĩnh Vực: {question.field}</Text>
                                <Text style={styles.questionText}>Nội Dung: {question.question}</Text>
                            </View>
                        )}
                    />
                )}

                {isExpert && (
                    <View style={styles.inputContainer}>
                        <TextInput
                            value={response}
                            onChangeText={(text) => setResponse(text)}
                            placeholder="Gửi Phản Hồi"
                            style={styles.textInput}
                        />
                        <TouchableOpacity style={styles.btnSend} onPress={handleResponseSubmit} >
                            <Icon name='send' size={24} color='black' />
                        </TouchableOpacity>
                    </View>
                )}

                {isOwner && (
                    <View style={styles.inputContainer}>
                        <TextInput
                            value={followUpQuestion}
                            onChangeText={(text) => setFollowUpQuestion(text)}
                            placeholder="Gửi Câu Hỏi Tiếp Theo"
                            style={styles.textInput}
                        />
                        <TouchableOpacity style={styles.btnSend} onPress={handleFollowUpQuestionSubmit} >
                            <Icon name='send' size={24} color='black' />
                        </TouchableOpacity>
                    </View>
                )}


            </SafeAreaView>
        </BackgroundImage>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    questionField: {
        color: 'black',
        fontSize: 20,
        fontWeight: 'bold',

    },
    btnBack: {
        // backgroundColor: '#F7F8F8',
        padding: 7,
        borderRadius: 8,
        // marginBottom: 16,
        marginRight: 10
    },
    questionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black'
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    currentUserContainer: {
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    otherUserContainer: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    userImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        resizeMode: 'contain',
        backgroundColor: 'black'
    },
    messageContent: {
        maxWidth: '70%',
        padding: 10,
        borderRadius: 10,
    },
    currentUserText: {
        backgroundColor: '#DCF8C6',
        color: '#000',
        padding: 15,
        borderRadius: 10,
    },
    otherUserText: {
        backgroundColor: '#FFF',
        color: '#000',
        padding: 15,
        borderRadius: 10,
    },
    currentUserTime: {
        color: 'black',
        textAlign: 'right',
        marginTop: 5,
        fontSize: 12
    },
    btnSend: {
        padding: 12,
        borderRadius: 50,
        backgroundColor: 'white',
    },
    otherUserTime: {
        color: 'black',
        textAlign: 'left',
        marginTop: 5,
        fontSize: 12
    },
    textInput: {

        padding: 10,
        flex: 1,
    },
    inputContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        borderColor: 'gray',
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
});

export default QuestionDetail;
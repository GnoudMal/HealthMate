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

            if (currentUser) {
                await firestore().collection('consultations').doc(questionId).update({
                    messages: firestore.FieldValue.arrayUnion({
                        userId: currentUser.uid,
                        content: followUpQuestion,
                        createdAt: new Date(),
                        type: 'followUp'
                    }),
                    updatedAt: firestore.FieldValue.serverTimestamp()
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
                await firestore().collection('consultations').doc(questionId).update({
                    messages: firestore.FieldValue.arrayUnion({
                        userId: currentUser.uid,
                        content: response,
                        createdAt: new Date(),
                        type: 'response'
                    }),
                    updatedAt: firestore.FieldValue.serverTimestamp()
                });

                setResponse('');
                setMessage('Phản hồi đã được gửi thành công.');
            }
        } catch (error) {
            console.log(error);
            setMessage('Có lỗi xảy ra. Vui lòng thử lại.');
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

                {message ? <Text>{message}</Text> : null}
                {question && (
                    <FlatList
                        data={messages}
                        renderItem={renderMessageItem}
                        keyExtractor={(item, index) => index.toString()}
                        ListHeaderComponent={() => (
                            <>
                                <Text style={styles.questionField}>Lĩnh Vực: {question.field}</Text>
                                <Text style={styles.questionText}>Nội Dung: {question.question}</Text>
                            </>
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
        padding: 20,
    },
    questionField: {
        fontWeight: 'bold',
        marginBottom: 10,
    },
    questionText: {
        marginVertical: 10,
        fontSize: 16,
        fontWeight: 'bold'
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
        borderRadius: 5,
        borderColor: 'gray',
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
});

export default QuestionDetail;
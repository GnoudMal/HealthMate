import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import getAuth from '@react-native-firebase/auth';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const ConsultationForm = ({ navigation }) => {
    const [field, setField] = useState('');
    const [question, setQuestion] = useState('');
    const [message, setMessage] = useState('');
    const user = getAuth().currentUser;
    const [role, setRole] = useState(null);


    useEffect(() => {
        const fetchUserRole = async () => {
            const user = getAuth().currentUser;
            console.log('check auth', user);
            if (user) {
                try {
                    const userDoc = await firestore().collection('Users').doc(user.uid).get();
                    console.log('info', user.uid);
                    if (userDoc.exists) {
                        setRole(userDoc.data().role);
                        console.log('ơ', role);

                        // Giả sử thông tin vai trò được lưu trong trường 'role'
                    }
                } catch (error) {
                    console.error('Error fetching user role: ', error);
                }
            }
        };
        fetchUserRole();
    }, []);

    const handleSubmit = async () => {
        if (!field || !question) {
            setMessage('Vui lòng điền đầy đủ thông tin.');
            return;
        }

        if (user) {
            try {
                await firestore().collection('consultations').add({
                    field,
                    question,
                    userId: user.uid,
                    expertId: null,
                    responses: [],
                    createdAt: firestore.FieldValue.serverTimestamp(),
                    updatedAt: firestore.FieldValue.serverTimestamp(),
                });
                setMessage('Yêu cầu đã được gửi thành công.');
                setField('');
                setQuestion('');
            } catch (error) {
                console.error('Error adding document: ', error);
                setMessage('Có lỗi xảy ra. Vui lòng thử lại.');
            }
        } else {
            setMessage('Vui lòng đăng nhập để gửi yêu cầu.');
        }
    };

    return (
        <SafeAreaView style={{ paddingHorizontal: 20 }}>
            {(role === 'consultant' || role === 'admin') && (
                <TouchableOpacity style={styles.btnCheck} onPress={() => navigation.navigate('ExpertConsultationsScreen')}
                >
                    <Text style={{ fontWeight: 'bold', fontSize: 16, }}>Xem yêu cầu tư vấn</Text>
                </TouchableOpacity>
            )}
            <View style={{ backgroundColor: 'rgba(249, 177, 181, 0.5)', marginVertical: 10, borderRadius: 12, padding: 10 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Chọn Lĩnh Vực Tư Vấn:</Text>
                <Picker style={{ backgroundColor: 'white', marginTop: 10 }} selectedValue={field} onValueChange={(itemValue) => setField(itemValue)}>
                    <Picker.Item label="Tinh Thần" value="Tinh Thần" />
                    <Picker.Item label="Sức khỏe" value="Sức Khỏe" />
                </Picker>
            </View>
            <View style={{ backgroundColor: 'rgba(198, 188, 239, 0.6)', borderRadius: 12, padding: 10 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Nội Dung Cần Tư Vấn:</Text>
                <TextInput
                    value={question}
                    onChangeText={(text) => setQuestion(text)}
                    multiline
                    numberOfLines={14}

                    style={{ borderColor: 'gray', borderWidth: 1, marginVertical: 10, backgroundColor: 'white', borderRadius: 10, marginBottom: 20 }}
                />
                <TouchableOpacity style={{ backgroundColor: 'black', padding: 10, width: '50%', alignSelf: 'center', borderRadius: 12, elevation: 10, alignItems: 'center', justifyContent: 'center' }} onPress={handleSubmit} >
                    <Text style={{ fontWeight: 'bold', color: 'white' }}>Gửi</Text>
                </TouchableOpacity>
                {message ? <Text>{message}</Text> : null}
            </View>

        </SafeAreaView >

    );
};

const AnsweredQuestions = ({ navigation }) => {
    const [questions, setQuestions] = useState([]);
    const user = getAuth().currentUser;

    const fetchAnsweredQuestions = async () => {
        if (user) {
            try {
                const querySnapshot = await firestore()
                    .collection('consultations')
                    .where('userId', '==', user.uid)
                    .where('messages', '!=', [])
                    .get();
                const fetchedQuestions = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                console.log('check quest', fetchedQuestions.messages);
                setQuestions(fetchedQuestions);
            } catch (error) {
                console.error('Error fetching answered questions: ', error);
            }
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAnsweredQuestions();
        }, [user])
    );

    const handleQuestionPress = (questionId) => {
        navigation.navigate('QuestionDetail', { questionId });
    };

    console.log(questions);

    return (

        <View style={{ padding: 20 }}>
            {questions.length > 0 ? (
                questions.map(question => (
                    <TouchableOpacity
                        key={question.id}
                        style={styles.questionContainer}
                        onPress={() => handleQuestionPress(question.id)}
                    >
                        <Text style={styles.questionField}>Lĩnh Vực: {question.field}</Text>
                        <Text style={styles.questionText}>Nội Dung: {question.question}</Text>
                        <Text style={styles.responseText}>Phản Hồi: {question.messages[0].content}</Text>
                    </TouchableOpacity>
                ))
            ) : (
                <Text>Không có câu hỏi nào đã được trả lời.</Text>
            )}
        </View>
    );
};



const ConsultationTabs = () => {
    const navigation = useNavigation();

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'consultation', title: 'Tư Vấn' },
        { key: 'answered', title: 'Đã Trả Lời' },
    ]);

    const renderScene = SceneMap({
        consultation: () => <ConsultationForm navigation={navigation} />,
        answered: () => <AnsweredQuestions navigation={navigation} />,
    });

    const renderTabBar = props => (
        <TabBar
            {...props}
            style={{ backgroundColor: '#E6D0C5', borderTopEndRadius: 20, borderTopStartRadius: 20 }} // Màu nền của tab bar
            indicatorStyle={{ backgroundColor: 'black' }}
            labelStyle={{ color: 'black', fontWeight: 'bold' }}
        />
    );


    return (
        <ImageBackground style={{ flex: 1 }} source={{ uri: 'https://i.pinimg.com/736x/f5/4b/6c/f54b6c2d7190795536ae7aae7382426e.jpg' }}>
            <SafeAreaView style={styles.container}>
                <TabView
                    renderTabBar={renderTabBar}
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={{ width: '100%' }}
                />
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 16,
    },
    questionContainer: {
        marginBottom: 20,
        padding: 15,
        borderColor: 'gray',
        borderWidth: 1,
    },
    questionField: {
        fontWeight: 'bold',
    },
    questionText: {
        marginVertical: 10,
    },
    responseText: {
        color: 'blue',
    },
    btnCheck: {
        width: '50%',
        alignItems: 'center',
        padding: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(197, 230, 224, 0.6)',
        // elevation: 10
    }
});

export default ConsultationTabs;

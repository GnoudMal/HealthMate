import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Modal, TextInput, Pressable, Alert, Button } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Ionicons';
import Icon3 from 'react-native-vector-icons/AntDesign';
import * as ImagePicker from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchEntries, addEntryToFirestore, deleteEntryFromFirestore, updateEntryInFirestore, addSharedEntryToFirestore } from '../actions/gratitudeActions';
import { useNavigation } from '@react-navigation/native';
import { addGoalToFirestore, fetchGoals } from '../actions/GoalActions';
import { Notifications } from 'react-native-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import { share } from 'rxjs';
import { fetchUserInfo } from '../actions/userAction';
import PushNotification from 'react-native-push-notification';

const GratitudeScreen = () => {
    const navigation = useNavigation();
    const goals = useSelector((state) => state.goal.goals);

    const [userId, setUserId] = useState(null);
    const dispatch = useDispatch();
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const { entries, status, error } = useSelector(state => state.gratitude);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editEntryId, setEditEntryId] = useState(null);
    const currentGoal = goals.find(goal => goal.function === 'Gratitude') || { target: 0 };
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [goalModalVisible, setGoalModalVisible] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [isTimePickerVisible, setTimePickerVisible] = useState(false);
    const [reminderTime, setReminderTime] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [hinhAnh, setHinhAnh] = useState(null);
    const [modalShareVisible, setModalShareVisible] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [selectedEntry, setSelectedEntry] = useState(null);
    const { userInfo } = useSelector((state) => state.user);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    console.log('check goal', goals);


    useEffect(() => {
        if (userId) {
            dispatch(fetchUserInfo(userId));
        }
    }, [dispatch, userId]);

    useEffect(() => {
        configureNotifications();
    }, [userId]);

    useEffect(() => {
        const getUserId = async () => {
            try {
                const id = await AsyncStorage.getItem('userId');
                if (id !== null) {
                    setUserId(id);
                } else {
                    // console.warn('No userId found in AsyncStorage');
                }
            } catch (error) {
                console.error('Failed to load userId from AsyncStorage', error);
            }
        };

        getUserId();
    }, []);

    const configureNotifications = () => {
        PushNotification.configure({
            onRegister: function (token) {
                console.log("TOKEN:", token);
            },
            onNotification: function (notification) {
                Alert.alert('Thông báo', notification.message);
                notification.finish(PushNotificationIOS.FetchResult.NoData);
            },
            popInitialNotification: true,
            requestPermissions: Platform.OS === 'ios',
        });

        if (Platform.OS === 'android') {
            PushNotification.createChannel(
                {
                    channelId: 'default-channel-id', // (required)
                    channelName: 'Default Channel', // (required)
                    channelDescription: 'A default channel', // (optional)
                    soundName: 'default', // (optional)
                    importance: 4, // (optional) - 4 is the highest priority
                    vibrate: true, // (optional) - if you want vibration
                    ticker: "Có thông báo mới",
                },
                (created) => console.log(`CreateChannel returned '${created}'`) // (optional)
            );
        }
        // scheduleNotification();
    };

    const scheduleNotification = (hour, minute) => {
        const now = new Date();
        const notificationTime = new Date();
        notificationTime.setHours(hour, minute, 0, 0);

        if (now > notificationTime) {
            notificationTime.setDate(notificationTime.getDate() + 1); // Lên lịch thông báo vào ngày tiếp theo
        }

        PushNotification.localNotificationSchedule({
            ticker: "Có thông báo mới",
            message: "Đến giờ viết biết ơn rồi, hãy tâm sự nào!",
            date: notificationTime,
            allowWhileIdle: true,
            largeIcon: 'img_health',
            color: 'green',
            smallIcon: 'img_health',
            channelId: 'default-channel-id',
        });
    };


    const handleConfirm = (time) => {
        setReminderTime(time);
        hideTimePicker();
        scheduleReminder(time);
    };

    const handleSharePress = (entry) => {
        setSelectedEntry(entry);
        setModalShareVisible(true);
    };

    const handleShareSubmit = async () => {
        const sharedEntry = {
            ...selectedEntry,
            nameUser: userInfo.username,
            avatar: userInfo.avatarUrl || 'https://taytou.com/wp-content/uploads/2022/08/Anh-Avatar-dai-dien-mac-dinh-nam-nen-xam.jpeg',
            status: statusText,
            sharedAt: new Date().toISOString(),
            shareBy: userId,

        };

        console.log('check log 3', sharedEntry);


        try {
            const snapshot = await firestore().collection('sharedEntries')
                .where('id_user', '==', userId)
                .where('title', '==', sharedEntry.title)
                .get();

            if (!snapshot.empty) {
                Alert.alert('Error', 'You have already shared this entry.');
                setModalShareVisible(false);
                setStatusText('');
                return;
            }

            dispatch(addSharedEntryToFirestore({ entry: sharedEntry, id_user: userId }));
            setModalShareVisible(false);
            setStatusText('');
        } catch (error) {
            console.error('Failed to check shared entry', error);
        }
    };
    const scheduleReminder = (time) => {
        const notification = {
            title: 'Nhắc nhở viết lời biết ơn',
            body: 'Đừng quên viết lời biết ơn hôm nay!',
            fireDate: new Date(time).toISOString(),
            repeatInterval: 'day',
        };

        Notifications.postLocalNotification(notification);
        Alert.alert('Nhắc nhở đã được thiết lập', 'Bạn sẽ nhận được thông báo vào thời gian bạn đã chọn.');
    };



    useEffect(() => {
        if (userId) {
            dispatch(fetchEntries(userId));
            dispatch(fetchGoals(userId));
        }
    }, [dispatch, userId]);

    const handleAddEntry = async () => {

        if (!userId) {
            alert('User ID is not available');
            return;
        }

        console.log('User ID:', userId);

        const newEntry = {
            title: newTitle,
            content: newContent,
            date: new Date().toISOString(),
            image: imageUrl
        };
        if (hinhAnh) {
            try {
                const url = await uploadImage(hinhAnh);
                if (url) {
                    newEntry.image = url;
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Failed to upload image.');
                return;
            }
        }

        dispatch(addEntryToFirestore({ entry: newEntry, id_user: userId }))
            .then(() => console.log('Entry added successfully'),
                setNewTitle(''),
                setNewContent(''),
                setAddModalVisible(false),
            )
            .catch(error => console.error('Error adding entry:', error));
    };

    const chonAnh = useCallback(() => {
        let options = {
            mediaType: 'photo',
            selectionLimit: 1,
        };
        ImagePicker.launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                setHinhAnh(response);
            }
        });
    }, []);

    const uploadImage = async (image) => {
        const { uri } = image.assets[0];
        const filename = uri.substring(uri.lastIndexOf('/') + 1);
        const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
        console.log(uploadUri);
        try {
            await storage().ref(filename).putFile(uploadUri);
            const url = await storage().ref(filename).getDownloadURL();
            setImageUrl(url);
            return url;
        } catch (e) {
            console.log('eror ne');
            console.error(e);
            return null;
        }
    };

    const saveImageUrlToFirestore = async (url) => {
        try {
            await firestore().collection('gratitudeEntries').doc(userId).update({
                avatarUrl: url,
            });
            alert('Image uploaded successfully!');
        } catch (e) {
            console.error(e);
            alert('Failed to save image URL to Firestore.');
        }
    };

    const handleImageUpload = async () => {
        if (hinhAnh) {
            const url = await uploadImage(hinhAnh);
            if (url) {
                await saveImageUrlToFirestore(url);
            }
        }
    };

    useEffect(() => {
        console.log(hinhAnh);
    }, [hinhAnh])

    const handleDeleteEntry = (id) => {
        if (!userId) {
            alert('User ID is not available');
            return;
        }
        Alert.alert(
            'Xóa Lời Biết Ơn',
            'Bạn có chắc chắn muốn xóa lời biết ơn này không?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa', onPress: () => dispatch(deleteEntryFromFirestore({ id, id_user: userId }))
                        .then(() => console.log('Entry deleted successfully'))
                        .catch(error => console.error('Error deleting entry:', error))
                },
            ],
            { cancelable: false }
        );
    };

    const openEditModal = (entry) => {
        setEditEntryId(entry.id);
        setEditTitle(entry.title);
        setEditContent(entry.content);
        setEditModalVisible(true);
    };

    const handleUpdateEntry = () => {
        if (!userId || !editEntryId) {
            alert('User ID or Entry ID is not available');
            return;
        }

        const updatedEntry = {
            title: editTitle,
            content: editContent,
            date: new Date().toISOString()
        };

        dispatch(updateEntryInFirestore({ id: editEntryId, updatedEntry }))
            .then(() => {
                console.log('Entry updated successfully');
                setEditTitle('');
                setEditContent('');
                setEditEntryId(null);
                setEditModalVisible(false);
            })
            .catch(error => console.error('Error updating entry:', error));
    };

    const renderEditModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={editModalVisible}
            onRequestClose={() => setEditModalVisible(false)}
        >
            <View style={styles.modalViewAdd}>
                <View style={styles.modalBlockAdd}>
                    <Pressable onPress={() => setEditModalVisible(false)}>
                        <View style={styles.modalDecor}></View>
                    </Pressable>

                    <TextInput
                        placeholderTextColor={'#FFFFFF'}
                        style={styles.input}
                        placeholder="Title"
                        value={editTitle}
                        onChangeText={setEditTitle}
                    />
                    <TextInput
                        placeholderTextColor={'#FFFFFF'}
                        style={[styles.input, { height: 100 }]}
                        placeholder="Description"
                        value={editContent}
                        onChangeText={setEditContent}
                    />

                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity onPress={handleUpdateEntry} style={styles.btnTask}>
                            <Text style={styles.btnText}>Cập Nhật</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnTask} onPress={() => setEditModalVisible(false)}>
                            <Text style={styles.btnText}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const handleSelectGoal = (goal) => {
        setSelectedGoal(goal);
        setGoalModalVisible(false);

        if (!userId) {
            alert('User ID is not available');
            return;
        }

        // Xác định ngày bắt đầu và ngày kết thúc
        const startDate = new Date().toISOString();
        let endDate;
        switch (goal) {
            case '21 ngày':
                endDate = new Date();
                endDate.setDate(endDate.getDate() + 21);
                break;
            case '66 ngày':
                endDate = new Date();
                endDate.setDate(endDate.getDate() + 66);
                break;
            case '90 ngày':
                endDate = new Date();
                endDate.setDate(endDate.getDate() + 90);
                break;
            default:
                endDate = new Date();
        }

        const newGoal = {
            function: 'Gratitude',
            target: goal,
            unit: 'ngày',
            startDay: startDate,
            endDay: endDate.toISOString(),
            userId: userId,
        };

        console.log(newGoal);


        dispatch(addGoalToFirestore({ goal: newGoal, id_user: userId }))
            .then(() => console.log('Goal added successfully'))
            .catch(error => console.error('Error adding goal:', error));
    };


    const renderGoalModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={goalModalVisible}
            onRequestClose={() => setGoalModalVisible(false)}
        >
            <View style={styles.modalViewGoal}>
                <View style={styles.modalBlockGoal}>
                    <Pressable onPress={() => setGoalModalVisible(false)}>
                        <View style={[styles.modalDecor, { alignSelf: 'center', backgroundColor: 'black' }]}></View>
                    </Pressable>

                    <Text style={styles.modalTitle}>Chọn Mục Tiêu</Text>
                    <TouchableOpacity onPress={() => handleSelectGoal('21 ngày')} style={styles.goalOption}>
                        <Text style={styles.goalText}>21 ngày: phá bỏ thói quen cũ, tạo thói quen mới</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSelectGoal('66 ngày')} style={styles.goalOption}>
                        <Text style={styles.goalText}>66 ngày: tạo được thói quen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSelectGoal('90 ngày')} style={styles.goalOption}>
                        <Text style={styles.goalText}>90 ngày: thói quen tự động</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const saveRunGoalToFirestore = async (formattedTime) => {
        const now = new Date();
        console.log('check goal fb', formattedTime);

        try {
            await firestore().collection('GratitudeTimes').doc(userId).set({
                updatedAt: now,
                notificationTime: formattedTime
            });
            console.log("Run goal saved successfully!");
            // Schedule notifications after saving to Firestore
            const [hour, minute] = formattedTime.split(':').map(Number);
            console.log('hour check', hour);

            scheduleNotification(hour, minute);
        } catch (error) {
            console.error("Error saving Run goal to Firestore", error);
        }
    };


    const renderItem = ({ item }) => (
        <Pressable style={styles.card} onPress={() => openEditModal(item)} key={item.id}>
            <View>
                <Image source={{ uri: item.image }} style={styles.imgCard} />
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardContent}>{item.content}</Text>
                <Text style={styles.cardDate}>Created at {new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <View style={{ justifyContent: 'space-between' }}>
                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={() => handleSharePress(item)}
                >
                    <Icon3 name="sharealt" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteEntry(item.id)}
                >
                    <Icon name="trash" size={28} color="#fff" />
                </TouchableOpacity>

            </View>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon2 name="arrow-back" size={24} color="#08192C" />
                </TouchableOpacity>

                <View style={styles.headerIcons}>
                    <Icon3 name="pushpin" size={24} onPress={() => setGoalModalVisible(true)} color="#000" style={styles.icon} />
                    <Icon2 onPress={() => setShowTimePicker(true)} name="time" size={24} color="#000" style={styles.icon} />

                    <Image
                        style={styles.profileImage}
                        source={{ uri: userInfo.avatarUrl || 'https://taytou.com/wp-content/uploads/2022/08/Anh-Avatar-dai-dien-mac-dinh-nam-nen-xam.jpeg' }}
                    />
                </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity >
                    <Icon name="list" size={24} color="#000" style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.title}>BIẾT ƠN</Text>
            </View>
            {status === 'loading' && <Text>Đang tải...</Text>}
            {error && <Text style={styles.error}>{error}</Text>}
            <View style={styles.goalSection}>
                <Text style={styles.goalTitle}>Mục tiêu hiện tại: {currentGoal.target}</Text>

                {/* <TouchableOpacity onPress={() => setGoalModalVisible(true)} style={styles.selectGoalButton}>
                    <Text style={styles.selectGoalText}>Chọn Mục Tiêu</Text>
                </TouchableOpacity> */}
            </View>
            <FlatList
                data={entries}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.contentContainer}
            />
            <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)}>
                <Icon name="plus" size={24} color="#fff" />
            </TouchableOpacity>
            {renderEditModal()}
            <Modal
                animationType="slide"
                transparent={true}
                visible={addModalVisible}
                onRequestClose={() => setAddModalVisible(false)}
            >
                <View style={styles.modalViewAdd} >
                    <View style={styles.modalBlockAdd}>
                        <Pressable onPress={() => setAddModalVisible(false)}>
                            <View style={styles.modalDecor} ></View>
                        </Pressable>

                        <TextInput
                            placeholderTextColor={'#FFFFFF'}
                            style={styles.input}
                            placeholder="Title"
                            value={newTitle}
                            onChangeText={setNewTitle}
                        />
                        <TextInput
                            placeholderTextColor={'#FFFFFF'}
                            style={[styles.input, { height: 100 }]}
                            placeholder="Description"
                            value={newContent}
                            onChangeText={setNewContent}
                        />

                        <TouchableOpacity style={styles.imageButton} onPress={chonAnh}>
                            <Text style={styles.imageButtonText}>Chọn Ảnh</Text>
                        </TouchableOpacity>
                        {hinhAnh && (
                            <Image source={{ uri: hinhAnh.assets[0].uri }} style={styles.avatar} />
                        )}



                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={handleAddEntry} style={styles.btnTask}>
                                <Text style={styles.btnText}>Thêm Lời Biết Ơn</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnTask} onPress={() => setAddModalVisible(false)} >
                                <Text style={styles.btnText}>Hủy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalShareVisible}
                onRequestClose={() => setModalShareVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Share Entry</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Write your status..."
                            value={statusText}
                            onChangeText={setStatusText}
                        />
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={handleShareSubmit}>
                                <Text style={styles.buttonText}>Submit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setModalShareVisible(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {renderGoalModal()}
            {showTimePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => {
                        if (date) {
                            setSelectedDate(date);
                            const formattedTime = `${date.getHours()}:${date.getMinutes()}`;
                            saveRunGoalToFirestore(formattedTime);
                            setShowTimePicker(false);
                        } else {
                            setShowTimePicker(false);
                        }
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 40,
        paddingHorizontal: 20,
    },
    imgCard: {
        width: 200,
        height: 200,
        borderRadius: 50,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    avatar: {
        width: 200,
        height: 200,
        // borderRadius: 50,
        marginBottom: 20,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginHorizontal: 10,
    },
    headerIcons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon: {
        marginHorizontal: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF6F61',
        marginVertical: 20,
    },
    imageButton: {
        padding: 10,
        backgroundColor: 'black',
        borderRadius: 14,
        elevation: 10,
        marginBottom: 15,
    },
    imageButtonText: {
        color: 'white',
    },
    contentContainer: {
        paddingBottom: 100,
    },
    card: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        backgroundColor: '#FF6F61',
        borderRadius: 10,
        padding: 20,
        marginVertical: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    cardContent: {
        fontSize: 16,
        color: '#fff',
        marginVertical: 10,
    },
    cardDate: {
        fontSize: 14,
        color: '#fff',
    },
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        right: 30,
        bottom: 30,
        backgroundColor: '#FF6F61',
        borderRadius: 30,
        elevation: 8,
    },
    error: {
        color: 'red',
        marginBottom: 16,
    },
    modalViewAdd: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalBlockAdd: {
        // borderWidth: 1,
        width: '100%',
        backgroundColor: '#F79E89',
        paddingHorizontal: 20,
        paddingBottom: 20,
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        borderTopEndRadius: 20,
        borderTopStartRadius: 20,
    },
    input: {

        borderWidth: 2,
        borderColor: '#FFFFFF',
        borderRadius: 12,
        padding: 10,
        marginBottom: 15,
        fontSize: 18,
        width: '100%',
        // elevation: 7
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    btnTask: {
        backgroundColor: '#FFFFFF',
        padding: 10,
        marginEnd: 10,
        elevation: 7,
        borderRadius: 10,
        // borderColor: 'black',
        // borderWidth: 1,
    },
    btnText: {
        fontWeight: '700',
        color: '#F79E89'
    },
    modalDecor: {
        width: 91.31,
        height: 6.48,
        backgroundColor: 'white',
        marginVertical: 20,
        borderRadius: 30,
    },
    deleteButton: {
        marginTop: 10,
        backgroundColor: '#FF6F61',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    goalSection: {
        // position: 'absolute',
        // bottom: 80,
        // left: 0,
        // right: 0,
        alignItems: 'center',
    },
    goalTitle: {
        fontSize: 18,
        marginBottom: 10,
    },
    selectGoalButton: {
        backgroundColor: '#1E90FF',
        padding: 10,
        borderRadius: 5,
    },
    selectGoalText: {
        color: '#fff',
        fontSize: 16,
    },
    modalViewGoal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalBlockGoal: {
        width: '80%',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    goalOption: {
        padding: 10,
        backgroundColor: '#F5F5F5',
        borderRadius: 5,
        marginBottom: 10,
    },
    goalText: {
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        backgroundColor: '#2196F3',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: 'red',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default GratitudeScreen;

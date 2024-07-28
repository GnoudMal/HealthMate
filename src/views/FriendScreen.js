import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddFriendScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [userId, setUserId] = useState(null);
    const [friendsList, setFriendsList] = useState([]);

    useEffect(() => {
        const unsubscribe = firestore()
            .collection('friendRequests')
            .where('toUser', '==', userId)
            .where('status', '==', 'pending')
            .onSnapshot(querySnapshot => {
                const requests = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setFriendRequests(requests);
            });

        return () => unsubscribe();
    }, [userId]);

    useEffect(() => {
        const getUserId = async () => {
            try {
                const id = await AsyncStorage.getItem('userId');
                if (id !== null) {
                    setUserId(id);
                    const userDoc = await firestore().collection('Users').doc(id).get();
                    const friends = userDoc.data().friends || [];
                    setFriendsList(friends);
                } else {
                    console.warn('No userId found in AsyncStorage');
                }
            } catch (error) {
                console.error('Failed to load userId from AsyncStorage', error);
            }
        };

        getUserId();
    }, []);

    const handleSearch = async () => {
        try {
            const userSnapshot = await firestore()
                .collection('Users')
                .where('username', '==', username)
                .get();

            if (userSnapshot.empty) {
                Alert.alert('Không tìm thấy người dùng', 'Vui lòng kiểm tra lại username');
                setSearchResults([]);
                return;
            }

            const results = userSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            setSearchResults(results);
        } catch (error) {
            console.error('Lỗi khi tìm kiếm người dùng:', error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tìm kiếm người dùng');
        }
    };

    const handleAddFriend = async (friendId, name) => {
        if (friendsList.includes(friendId)) {
            Alert.alert('Thông báo', 'Bạn đã là bạn bè rồi.');
            return;
        }

        try {
            await firestore()
                .collection('friendRequests')
                .add({
                    fromUserName: name,
                    fromUser: userId,
                    toUser: friendId,
                    status: 'pending',
                    createdAt: firestore.FieldValue.serverTimestamp(),
                });

            Alert.alert('Thành công', 'Yêu cầu kết bạn đã được gửi');
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu kết bạn:', error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi gửi yêu cầu kết bạn');
        }
    };

    const handleAcceptFriendRequest = async (requestId, fromUserId) => {
        try {
            await firestore()
                .collection('friendRequests')
                .doc(requestId)
                .update({
                    status: 'accepted',
                });

            await firestore()
                .collection('Users')
                .doc(userId)
                .update({
                    friends: firestore.FieldValue.arrayUnion(fromUserId),
                });

            await firestore()
                .collection('Users')
                .doc(fromUserId)
                .update({
                    friends: firestore.FieldValue.arrayUnion(userId),
                });

            Alert.alert('Thành công', 'Bạn đã chấp nhận yêu cầu kết bạn');
        } catch (error) {
            console.error('Lỗi khi chấp nhận yêu cầu kết bạn:', error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi chấp nhận yêu cầu kết bạn');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'flex-start' }}>
                <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>Bạn Bè</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập username"
                    value={username}
                    onChangeText={setUsername}
                    placeholderTextColor={'black'}
                />
                <TouchableOpacity onPress={handleSearch}>
                    <Icon name='search' size={24} color='black' />
                </TouchableOpacity>
            </View>
            <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.userCard}>
                        <View style={styles.userInfo}>
                            <Image
                                style={styles.profileImage}
                                source={{ uri: item.avatarUrl || 'https://taytou.com/wp-content/uploads/2022/08/Anh-Avatar-dai-dien-mac-dinh-nam-nen-xam.jpeg' }}
                            />
                            <Text style={styles.txtUsername}>{item.username}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => handleAddFriend(item.id, item.username)}
                            disabled={friendsList.includes(item.id)}
                        >
                            <Text style={styles.buttonText}>{friendsList.includes(item.id) ? 'Bạn bè' : 'Kết bạn'}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
            <FlatList
                data={friendRequests}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.userCard}>
                        <Text>{item.fromUser}</Text>
                        <TouchableOpacity style={styles.button} onPress={() => handleAcceptFriendRequest(item.id, item.fromUser)}>
                            <Text style={styles.buttonText}>Chấp nhận</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    title: {
        color: 'black',
        fontSize: 30,
        fontWeight: 'bold',
        marginLeft: 20,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    txtUsername: {
        fontSize: 16,
        fontWeight: '700',
    },
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginRight: 16,
    },
    input: {
        fontSize: 16,
        padding: 10,
    },
    userCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        opacity: 0.8,
    },
    buttonText: {
        color: '#fff',
    },
    btnBack: {
        width: 30,
        height: 30,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        marginLeft: 10,
    },
    searchContainer: {
        marginVertical: 20,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 15,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
});

export default AddFriendScreen;

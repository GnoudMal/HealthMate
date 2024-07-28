import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const FriendsListScreen = () => {
    const [friends, setFriends] = useState([]);
    const navigation = useNavigation();
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const getUserId = async () => {
            try {
                const id = await AsyncStorage.getItem('userId');
                if (id !== null) {
                    setUserId(id);
                    const userDoc = await firestore().collection('Users').doc(id).get();
                    const friendsList = userDoc.data().friends || [];
                    fetchFriendsDetails(friendsList);
                } else {
                    console.warn('No userId found in AsyncStorage');
                }
            } catch (error) {
                console.error('Failed to load userId from AsyncStorage', error);
            }
        };

        getUserId();
    }, []);

    const fetchFriendsDetails = async (friendsList) => {
        try {
            const friendsData = await Promise.all(friendsList.map(async (friendId) => {
                const friendDoc = await firestore().collection('Users').doc(friendId).get();
                return { id: friendId, ...friendDoc.data() };
            }));
            setFriends(friendsData);
        } catch (error) {
            console.error('Lỗi khi tải thông tin bạn bè:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>Danh Sách Bạn Bè</Text>
                <TouchableOpacity style={styles.btnBack} onPress={() => navigation.navigate('FriendScreen')}>
                    <Icon name="person-add-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={friends}
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
    btnBack: {
        width: 30,
        height: 30,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        marginLeft: 10,
    },
});

export default FriendsListScreen;

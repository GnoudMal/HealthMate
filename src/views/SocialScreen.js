import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSharedEntries, deleteSharedEntryFromFirestore } from '../redux/actions/gratitudeActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';

const SocialScreen = () => {
    const dispatch = useDispatch();
    const [userId, setUserId] = useState(null);
    const [friends, setFriends] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const { sharedEntries, status, error } = useSelector(state => state.gratitude);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const getUserId = async () => {
            try {
                const id = await AsyncStorage.getItem('userId');
                if (id !== null) {
                    setUserId(id);
                    setCurrentUserId(id); // Lưu ID người dùng hiện tại
                } else {
                    console.warn('No userId found in AsyncStorage');
                }
            } catch (error) {
                console.error('Failed to load userId from AsyncStorage', error);
            }
        };

        getUserId();
    }, []);

    console.log(sharedEntries);

    useEffect(() => {
        if (userId) {
            const fetchFriends = async () => {
                try {
                    const userDoc = await firestore().collection('Users').doc(userId).get();
                    if (userDoc.exists) {
                        setFriends(userDoc.data().friends || []);
                    }
                } catch (error) {
                    console.error('Failed to fetch friends', error);
                }
            };

            fetchFriends();
        }
    }, [userId]);

    useEffect(() => {
        if (userId && friends.length > 0) {

            dispatch(fetchSharedEntries({ userId, friends }));
        }
    }, [dispatch, userId, friends]);

    const handleDelete = (docId, sharedBy) => {
        if (sharedBy !== currentUserId) {
            Alert.alert(
                "Xóa Bài Viết",
                "Bạn Không Có Quyền Xóa Bài Viết Này.",
                [{ text: "OK", style: "default" }]
            );
            return;
        }

        Alert.alert(
            "Xóa Bài Viết",
            "Bạn Có Muốn Xóa Bài Viết Này Không?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "OK",
                    onPress: async () => {
                        try {
                            await dispatch(deleteSharedEntryFromFirestore(docId));
                            console.log('Entry deleted successfully');
                        } catch (error) {
                            console.error('Failed to delete entry', error);
                        }
                    }
                }
            ]
        );
    };

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        if (userId && friends.length > 0) {
            await dispatch(fetchSharedEntries({ userId, friends }));
        }
        setRefreshing(false);
    }, [dispatch, userId, friends]);

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingHorizontal: 20, }}>
                {item.shareBy === currentUserId && (
                    <TouchableOpacity onPress={() => handleDelete(item.docId, item.shareBy)} style={styles.deleteButton}>
                        {/* <Text style={styles.deleteButtonText}>Xóa</Text> */}
                        <Icon name='ellipsis-v' size={20} color='rgba(162, 162, 162, 1)' />
                    </TouchableOpacity>
                )}
                <Image source={{ uri: item.avatar }} style={styles.imgAvatar} />
                <View>
                    <Text style={styles.cardName}>{item.nameUser}</Text>
                    <Text style={styles.cardDate}>Đăng Lúc {new Date(item.sharedAt).toLocaleDateString()}</Text>
                </View>
            </View>
            <Text style={styles.cardTitle}>{item.status}</Text>
            <View style={{ borderTopWidth: 1, marginHorizontal: 20, padding: 10, borderColor: 'rgba(38, 38, 38, 0.15)' }}>
                <Image source={{ uri: item.image }} style={styles.imgCard} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 10 }}>
                <Icon name='heart-o' size={28} color='rgba(162, 162, 162, 1)' />
                <Icon name='comment-o' size={28} color='rgba(162, 162, 162, 1)' />
                <Icon name='share' size={28} color='rgba(162, 162, 162, 1)' />
            </View>
            {/*<Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardContent}>{item.content}</Text>
            <Text style={styles.cardDate}>Đăng Lúc {new Date(item.sharedAt).toLocaleDateString()}</Text>
             <Text style={styles.cardSharedBy}>Shared by {item.shareBy}</Text> */}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Bài Đăng</Text>
            {status === 'loading' && <Text>Loading...</Text>}
            {error && <Text style={styles.error}>{error}</Text>}
            <FlatList
                data={sharedEntries}
                renderItem={renderItem}
                keyExtractor={item => item.docId}
                contentContainerStyle={styles.contentContainer}
                refreshing={refreshing}
                onRefresh={handleRefresh}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    card: {
        elevation: 7,
        backgroundColor: '#fff',
        paddingVertical: 20,
        marginBottom: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 10,
    },
    imgCard: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        borderWidth: 1,

    },
    imgAvatar: {
        width: 35,
        height: 35,
        borderRadius: 50,
    },
    cardName: {
        paddingHorizontal: 20,
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardTitle: {
        paddingHorizontal: 20,
        fontSize: 18,
        fontWeight: '400',
        marginVertical: 10,
    },
    deleteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        // backgroundColor: '#ff0000',
        borderRadius: 5,
        padding: 5,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 12,
    },
    cardContent: {
        fontSize: 16,
        marginTop: 10,
    },
    cardDate: {
        paddingHorizontal: 20,
        fontSize: 14,
        color: '#999',
    },
    cardSharedBy: {
        fontSize: 14,
        color: '#999',
        marginTop: 10,
    },
    error: {
        color: 'red',
    },
    contentContainer: {
        paddingBottom: 20,
    },
});

export default SocialScreen;

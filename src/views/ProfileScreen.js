import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Alert } from 'react-native';
import { View, Text, StyleSheet, Image, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const ProfileScreen = ({ navigation }) => {
    const [isEnabled, setIsEnabled] = React.useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    const handleLogout = async () => {
        Alert.alert(
            "Confirm Logout",
            "Are you sure you want to log out?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: "OK",
                    onPress: async () => {
                        try {
                            // Xóa dữ liệu trong AsyncStorage
                            await AsyncStorage.removeItem('userInfo');
                            await AsyncStorage.removeItem('userId');

                            // Chuyển hướng hoặc thực hiện các hành động khác sau khi đăng xuất
                            console.log('Logged out successfully');

                            // Ví dụ: Chuyển hướng về màn hình đăng nhập
                            navigation.navigate('LoginAccount');
                        } catch (error) {
                            console.error('Error during logout:', error);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView >
                <View style={styles.header}>
                    <Icon name="arrow-back" size={24} />
                    <Text style={styles.headerTitle}>Profile</Text>
                    <Icon name="ellipsis-horizontal" size={24} />
                </View>

                <View style={styles.profileSection}>
                    <Image
                        style={styles.profileImage}
                        source={{ uri: 'https://via.placeholder.com/100' }} // Thay bằng URL hình ảnh thực tế
                    />
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>GnouMal</Text>
                        <Text style={styles.profileProgram}>Lose a Fat Program</Text>
                    </View>
                    <TouchableOpacity style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsSection}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>180cm</Text>
                        <Text style={styles.statLabel}>Height</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>65kg</Text>
                        <Text style={styles.statLabel}>Weight</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>22yo</Text>
                        <Text style={styles.statLabel}>Age</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.sectionItem}>
                        <Icon name="person-outline" size={24} />
                        <Text style={styles.sectionItemText}>Personal Data</Text>
                        <Icon name="chevron-forward-outline" size={24} />
                    </View>
                    <View style={styles.sectionItem}>
                        <Icon name="trophy-outline" size={24} />
                        <Text style={styles.sectionItemText}>Achievement</Text>
                        <Icon name="chevron-forward-outline" size={24} />
                    </View>
                    <View style={styles.sectionItem}>
                        <Icon name="time-outline" size={24} />
                        <Text style={styles.sectionItemText}>Activity History</Text>
                        <Icon name="chevron-forward-outline" size={24} />
                    </View>
                    <View style={styles.sectionItem}>
                        <Icon name="barbell-outline" size={24} />
                        <Text style={styles.sectionItemText}>Workout Progress</Text>
                        <Icon name="chevron-forward-outline" size={24} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notification</Text>
                    <View style={styles.sectionItem}>
                        <Icon name="notifications-outline" size={24} />
                        <Text style={styles.sectionItemText}>Pop-up Notification</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#81b0ff" }}
                            thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                            onValueChange={toggleSwitch}
                            value={isEnabled}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Other</Text>
                    <View style={styles.sectionItem}>
                        <Icon name="mail-outline" size={24} />
                        <Text style={styles.sectionItemText}>Contact Us</Text>
                        <Icon name="chevron-forward-outline" size={24} />
                    </View>
                    <View style={styles.sectionItem}>
                        <Icon name="lock-closed-outline" size={24} />
                        <Text style={styles.sectionItemText}>Privacy Policy</Text>
                        <Icon name="chevron-forward-outline" size={24} />
                    </View>
                    <View style={styles.sectionItem}>
                        <Icon name="settings-outline" size={24} />
                        <Text style={styles.sectionItemText}>Settings</Text>
                        <Icon name="chevron-forward-outline" size={24} />
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={styles.sectionItem}>
                        <Icon name="log-out-outline" size={24} />
                        <Text style={styles.sectionItemText}>Log Out</Text>
                        <Icon name="chevron-forward-outline" size={24} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    profileInfo: {
        flex: 1,
        marginLeft: 16,
    },
    profileName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    profileProgram: {
        color: '#666',
    },
    editButton: {
        backgroundColor: '#4e9bde',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    editButtonText: {
        color: '#fff',
    },
    statsSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
    },
    statBox: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    statLabel: {
        color: '#666',
    },
    section: {
        backgroundColor: '#fff',
        marginVertical: 8,
        padding: 16,
        borderRadius: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    sectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    sectionItemText: {
        flex: 1,
        marginLeft: 16,
        fontSize: 16,
    },
});

export default ProfileScreen;
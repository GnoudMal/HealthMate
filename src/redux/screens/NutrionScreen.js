import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, TextInput } from 'react-native';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Button } from 'react-native-elements';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserInfo, updateUserInfo } from '../actions/userAction';

const NutrionScreen = () => {
    const dispatch = useDispatch();
    const [userId, setUserId] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [gender, setGender] = useState('');
    const [loading, setLoading] = useState(true);
    const { userInfo, error } = useSelector((state) => state.user);
    const [bmi, setBmi] = useState(null);

    const [editHeight, setEditHeight] = useState('');
    const [editWeight, setEditWeight] = useState('');
    const [editGender, setEditGender] = useState('');

    const navigation = useNavigation();



    useEffect(() => {
        if (userInfo) {
            setHeight(userInfo.height);
            setWeight(userInfo.weight);
            setGender(userInfo.gender);
            calculateBMI(userInfo.height, userInfo.weight)
        }
    }, [userInfo]);

    const calculateBMI = (height, weight) => {
        if (height && weight) {
            const heightInMeters = height / 100;
            const bmiValue = weight / (heightInMeters * heightInMeters);
            setBmi(bmiValue.toFixed(1));
        }
    };


    useEffect(() => {
        const getUserId = async () => {
            try {
                const id = await AsyncStorage.getItem('userId');
                if (id !== null) {
                    setUserId(id);
                } else {
                    console.warn('No userId found in AsyncStorage');
                    setLoading(false);
                }
            } catch (error) {
                console.error('Failed to load userId from AsyncStorage', error);
                setLoading(false);
            }
        };

        getUserId();
    }, []);


    useEffect(() => {
        if (userId) {
            console.log(userId);
            dispatch(fetchUserInfo(userId)).finally(() => setLoading(false));
        }
    }, [dispatch, userId]);

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#36454F" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }
    const toggleModal = () => {
        console.log(userInfo);
        setEditHeight(userInfo.height);
        setEditWeight(userInfo.weight);
        setEditGender(userInfo.gender);


        console.log(editHeight);
        console.log(editWeight);
        setModalVisible(!isModalVisible);
    };

    const handleUpdateUser = () => {
        if (!userId) {
            alert('User ID is not available');
            return;
        }

        const updateUser = {
            height: editHeight,
            weight: editWeight,
            gender: editGender,
        };

        console.log('Updating user with:', updateUser);

        setLoading(true);
        dispatch(updateUserInfo({ id: userId, updateUser }))
            .then(() => {
                console.log('User updated successfully');
                toggleModal();
            })
            .catch(error => console.error('Error updating user:', error))
            .finally(() => setLoading(false));
    };

    const getDietRecommendation = (bmi) => {
        if (bmi < 18.5) {
            return {
                recommendation: "Bạn thiếu cân. Hãy tăng cường ăn các thực phẩm giàu protein và năng lượng như thịt, cá, trứng, sữa và các sản phẩm từ sữa.",
                menu: [
                    { meal: "Bữa sáng", dishes: ["Trứng ốp la", "Bánh mì nướng", "Sinh tố trái cây"], calories: [150, 200, 100] },
                    { meal: "Bữa trưa", dishes: ["Cơm trắng", "Thịt gà luộc", "Rau xào", "Trái cây"], calories: [250, 300, 150, 50] },
                    { meal: "Bữa tối", dishes: ["Cơm", "Cá hồi nướng", "Rau luộc", "Sữa chua"], calories: [300, 350, 50, 100] },
                ],
                image: require('../../images/body3.png'),
            };
        } else if (bmi >= 18.5 && bmi < 24.9) {
            return {
                recommendation: "Bạn có cân nặng bình thường. Hãy duy trì chế độ ăn uống cân bằng với đủ các nhóm thực phẩm: protein, tinh bột, chất béo, vitamin và khoáng chất.",
                menu: [
                    { meal: "Bữa sáng", dishes: ["Ngũ cốc", "Sữa tươi", "Trái cây"], calories: [200, 100, 50] },
                    { meal: "Bữa trưa", dishes: ["Cơm gạo lứt", "Thịt bò xào rau", "Salad", "Trái cây"], calories: [300, 350, 200, 50] },
                    { meal: "Bữa tối", dishes: ["Cơm", "Cá hấp", "Rau luộc", "Nước ép"], calories: [300, 250, 50, 150] },
                ],
                image: require('../../images/body1.png'),
            };
        } else if (bmi >= 25 && bmi < 29.9) {
            return {
                recommendation: "Bạn thừa cân. Hãy giảm lượng calo tiêu thụ, tránh thức ăn nhanh và đồ ngọt, tăng cường ăn rau xanh và trái cây.",
                menu: [
                    { meal: "Bữa sáng", dishes: ["Yến mạch", "Sữa chua không đường", "Trái cây"], calories: [250, 150, 50] },
                    { meal: "Bữa trưa", dishes: ["Salad gà", "Bánh mì nguyên cám", "Nước chanh"], calories: [200, 250, 50] },
                    { meal: "Bữa tối", dishes: ["Cá hồi hấp", "Rau xanh luộc", "Nước ép cần tây"], calories: [300, 50, 100] },
                ],
                image: require('../../images/body2.png'),
            };
        } else {
            return {
                recommendation: "Bạn béo phì. Hãy tham khảo ý kiến chuyên gia dinh dưỡng để có chế độ ăn phù hợp và kết hợp với việc tập luyện thể dục đều đặn.",
                menu: [
                    { meal: "Bữa sáng", dishes: ["Ngũ cốc nguyên hạt", "Sữa tươi không đường", "Trái cây"], calories: [300, 100, 50] },
                    { meal: "Bữa trưa", dishes: ["Salad cá ngừ", "Bánh mì nguyên cám", "Nước ép cà chua"], calories: [250, 200, 100] },
                    { meal: "Bữa tối", dishes: ["Gà nướng", "Rau xanh hấp", "Trái cây"], calories: [350, 50, 50] },
                ],
                image: require('../../images/body2.png'),
            };
        }
    };

    const { recommendation, menu, image } = getDietRecommendation(bmi);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#08192C" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ăn Uống</Text>
            </View>
            <View style={styles.cardBody}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.title}>Cơ Thể Của Bạn</Text>
                    <TouchableOpacity onPress={toggleModal} >
                        <Icon name="settings" size={24} color="#08192C" />
                    </TouchableOpacity>
                </View>
                <View style={styles.row}>
                    <Image source={image} style={styles.image} />
                    <View>
                        <Text style={styles.label}>{gender}</Text>
                        <View style={styles.details}>
                            <View>
                                <View style={{ marginVertical: 10 }}>
                                    <Text style={styles.value}>{height} cm</Text>
                                    <Text style={styles.subValue}>Height</Text>
                                </View>
                                <View style={{ marginVertical: 10 }}>
                                    <Text style={styles.value}>{weight} KG</Text>
                                    <Text style={styles.subValue}>Weight</Text>
                                </View>
                            </View>
                            <View style={{ marginStart: 30, alignSelf: 'flex-start', marginTop: 10 }}>
                                <Text style={styles.value}>8h 30m</Text>
                                <Text style={styles.subValue}>Sleep</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.card}>
                <Text style={styles.title}>BMI Của Bạn Là: {bmi}</Text>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.description}>
                        {recommendation}
                    </Text>
                    <Svg height="114" width="114" viewBox="0 0 100 100">
                        <Circle
                            cx="50%"
                            cy="50%"
                            r="40%"
                            fill="none"
                            stroke="#E0E0E0"
                            strokeWidth="20"
                        />
                        <Circle
                            cx="50%"
                            cy="50%"
                            r="40%"
                            fill="none"
                            stroke="#4CAF50"
                            strokeWidth="20"
                            strokeDasharray={`${bmi}, 100`}
                            strokeLinecap="round"
                        />
                        <SvgText
                            x="50%"
                            y="50%"
                            fontSize="16"
                            fontWeight="bold"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            fill="#4CAF50"
                        >
                            {bmi}
                        </SvgText>
                    </Svg>
                </View>
                <Text style={{ marginTop: 10, fontSize: 10, fontWeight: '500' }}>* Chỉ số BMI chỉ là một yếu tố, cần kết hợp với các yếu tố khác như vòng eo, tỷ lệ mỡ cơ thể để đánh giá chính xác hơn tình trạng sức khỏe.</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.title}>Thực Đơn Khuyến Cáo</Text>
                {menu.map((item, index) => (
                    <View key={index} style={styles.mealSection}>
                        <Text style={styles.mealTitle}>{item.meal}</Text>
                        {item.dishes.map((dish, dishIndex) => (
                            <View key={dishIndex} style={styles.dishRow}>
                                <Text style={styles.dishText}>- {dish}</Text>
                                <Text style={styles.calorieText}>{item.calories[dishIndex]} cal</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={toggleModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Cập nhật thông tin người dùng</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Chiều cao (cm)"
                            keyboardType="numeric"
                            value={editHeight}
                            onChangeText={setEditHeight}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Cân nặng (kg)"
                            keyboardType="numeric"
                            value={editWeight}
                            onChangeText={setEditWeight}
                        />
                        <Picker
                            selectedValue={editGender}
                            onValueChange={(itemValue) => setEditGender(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Chọn giới tính" value="" />
                            <Picker.Item label="Nam" value="Nam" />
                            <Picker.Item label="Nữ" value="Nữ" />
                        </Picker>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={handleUpdateUser}>
                                <Text style={styles.buttonText}>Cập nhật</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={toggleModal}>
                                <Text style={styles.buttonText}>Hủy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        padding: 16,
        marginTop: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: '#4CAF50',
        padding: 16,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#08192C',
    },
    cardBody: {
        alignSelf: 'center',
        width: 329,
        height: 245,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    label: {
        fontSize: 20,
        marginVertical: 10,
        fontWeight: 'bold',
    },
    image: {

        width: 50,
        height: 154,
        marginBottom: 8,
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    value: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subValue: {
        color: 'black',
        fontSize: 12,
        textAlign: 'center',
    },
    description: {
        width: '68%',
        fontSize: 14,
        color: '#555',
        marginTop: 8,
        fontWeight: '700'
    },
    mealSection: {
        marginTop: 12,
    },
    mealTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    dishRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    dishText: {
        fontSize: 14,
        color: '#555',
    },
    calorieText: {
        fontSize: 14,
        color: '#555',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 15,
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
    picker: {
        color: 'black',
        height: 50,
        width: '100%',
        marginBottom: 20,
    },
});

export default NutrionScreen;

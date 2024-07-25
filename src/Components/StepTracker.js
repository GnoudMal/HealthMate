import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSteps } from '../redux/actions/stepActions';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StepTracker = () => {
    const dispatch = useDispatch();
    // const userId = useSelector(state => state.user.id); // Lấy userId từ Redux store
    const [userId, setUserId] = useState(null);
    const [steps, setSteps] = useState(0);
    const previousMagnitude = useRef(0);

    useEffect(() => {
        const getUserId = async () => {
            try {
                const id = await AsyncStorage.getItem('userId');
                if (id !== null) {
                    setUserId(id);
                } else {
                    console.log('No userId found in AsyncStorage');
                }
            } catch (error) {
                console.error('Failed to load userId from AsyncStorage', error);
            }
        };

        getUserId();
    }, []);

    useEffect(() => {
        if (!userId) {
            return;
        }

        setUpdateIntervalForType(SensorTypes.accelerometer, 1000); // Cập nhật mỗi giây

        const subscription = accelerometer.subscribe(
            ({ x, y, z }) => {
                console.log('Accelerometer data:', { x, y, z }); // Kiểm tra dữ liệu đầu vào
                // console.log(userId);
                const newSteps = calculateSteps(x, y, z);
                // console.log(newSteps);
                setSteps(prevSteps => {
                    if (isNaN(prevSteps)) {
                        prevSteps = 0;
                    }
                    const totalSteps = prevSteps + newSteps;
                    dispatch(updateSteps({ userId, newSteps }));
                    return totalSteps;
                });
            },
            error => console.log('The sensor is not available', error)
        );

        return () => subscription.unsubscribe();
    }, [dispatch, userId]);

    const calculateSteps = (x, y, z) => {
        // Bộ đệm để lưu các giá trị gia tốc
        const bufferSize = 10;
        const buffer = [];

        buffer.push(Math.sqrt(x * x + y * y + z * z));
        if (buffer.length > bufferSize) {
            buffer.shift();
        }

        const averageMagnitude = buffer.reduce((a, b) => a + b) / buffer.length;
        const threshold = 1.0;

        return averageMagnitude > threshold ? 1 : 0;
    };


    useEffect(() => {
        const checkUserId = async () => {
            const id = await AsyncStorage.getItem('userId');
            if (id !== userId) {
                setUserId(id);
            }
        };

        const interval = setInterval(checkUserId, 1000); // Kiểm tra mỗi giây

        return () => clearInterval(interval); // Hủy kiểm tra khi component bị unmount
    }, [userId]);

    return null;
};

export default StepTracker;

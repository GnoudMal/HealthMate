import { StatusBar, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LoginAccount from './LoginScreen';
import SplashScreen from './SplashScreen';
import SignUp from './SignUp';
import HomeScreen from './HomeScreen';
import AdditionalInfoScreen from './AdditionalInfoScreen';
import StatsScreen from './StatsScreen';
import CameraScreen from './CameraScreen';
import ProfileScreen from './ProfileScreen';
import MindScreen from './MindScreen';
import SleepTracking from './SleepScreen';
import HealthScreen from './HealthScreen';
import PhysicalScreen from './PhysicalScreen';
import MentalHealthScreen from './EntertainmentScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Home') {
                    iconName = focused ? 'home' : 'home';
                } else if (route.name === 'Stats') {
                    iconName = focused ? 'bar-chart' : 'bar-chart';
                } else if (route.name === 'Search') {
                    iconName = focused ? 'search' : 'search';
                } else if (route.name === 'Camera') {
                    iconName = focused ? 'camera' : 'camera';
                } else if (route.name === 'Profile') {
                    iconName = focused ? 'person' : 'person';
                }

                return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'tomato',
            tabBarInactiveTintColor: 'gray',
            tabBarShowLabel: false,
            tabBarStyle: {
                height: 60,
                backgroundColor: '#fff',
                borderTopWidth: 0,
                elevation: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.34,
                shadowRadius: 6.27,
            },
        })}
    >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Stats" component={StatsScreen} />
        <Tab.Screen
            name="Search"
            component={AdditionalInfoScreen}
            options={{
                tabBarButton: (props) => (
                    <TouchableOpacity style={styles.searchButtonContainer} {...props}>
                        <View style={styles.searchButton}>
                            <Icon name="search" size={30} color="#fff" />
                        </View>
                    </TouchableOpacity>
                ),
            }}
        />
        <Tab.Screen name="Camera" component={CameraScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
);

const RootComponent = () => {
    return (
        <NavigationContainer>
            <StatusBar backgroundColor="transparent" translucent barStyle="dark-content" />
            <Stack.Navigator initialRouteName="SplashScreen" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="LoginAccount" component={LoginAccount} />
                <Stack.Screen name="SignUp" component={SignUp} />
                <Stack.Screen name="SplashScreen" component={SplashScreen} />
                <Stack.Screen name="HomeScreen" component={HomeTabs} />
                <Stack.Screen name="AdditionalInfoScreen" component={AdditionalInfoScreen} />
                <Stack.Screen name="MindScreen" component={MindScreen} />
                <Stack.Screen name="SleepTracking" component={SleepTracking} />
                <Stack.Screen name="HealthScreen" component={HealthScreen} />
                <Stack.Screen name="PhysicalScreen" component={PhysicalScreen} />
                <Stack.Screen name="MentalHealthScreen" component={MentalHealthScreen} />

            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default RootComponent;

const styles = StyleSheet.create({
    searchButtonContainer: {
        position: 'absolute',
        bottom: 30,
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#9BFD92',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 10,
    },
    searchButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#9BFD92',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 10,
        marginBottom: 10,
    },
});

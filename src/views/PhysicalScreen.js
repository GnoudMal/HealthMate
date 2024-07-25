import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import store from '../redux/store/store'
import ActivityScreen from '../redux/screens/ActivityScreen'
import { Provider } from 'react-redux'

const PhysicalScreen = () => {
    return (
        <Provider store={store}>
            <ActivityScreen />
        </Provider>
    )
}

export default PhysicalScreen

const styles = StyleSheet.create({})
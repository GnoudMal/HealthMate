import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import store from '../redux/store/store'
import { Provider } from 'react-redux'
import NutrionScreen from '../redux/screens/NutrionScreen'

const HealthScreen = () => {
    return (
        <Provider store={store}>
            <NutrionScreen />
        </Provider>
    )
}

export default HealthScreen

const styles = StyleSheet.create({})
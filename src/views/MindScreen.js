import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import GratitudeScreen from '../redux/screens/GratitudeScreen'
import store from '../redux/store/store'
import { Provider } from 'react-redux'

const MindScreen = () => {
    return (
        <Provider store={store}>
            <GratitudeScreen />
        </Provider>
    )
}

export default MindScreen

const styles = StyleSheet.create({})
import { StyleSheet, View } from 'react-native';
import React from 'react';
import RootComponent from './src/views/RootComponent';
import StepTracker from './src/Components/StepTracker'; // Đảm bảo đường dẫn chính xác
import { Provider } from 'react-redux';
import store from './src/redux/store/store';

const App = () => {
  return (
    <Provider store={store}>
      <View style={styles.container}>
        {/* <StepTracker /> */}
        <RootComponent />
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;

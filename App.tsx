import { StyleSheet, View } from 'react-native';
import React from 'react';
import RootComponent from './src/views/RootComponent';
import { Provider } from 'react-redux';
import store from './src/redux/store/store';
import { ThemeProvider } from './src/service/ThemeContext';
import AppContainer from './src/service/AppContainer';

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContainer>
          <RootComponent />
        </AppContainer>
      </ThemeProvider>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;

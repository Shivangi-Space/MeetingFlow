import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from './src/screens/HomeScreen';
import ResultScreen from './src/screens/ResultScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#111827',
          headerTitleStyle: {
            fontWeight: '700',
          },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{
          title: 'MeetingFlow',
        }} />
        <Stack.Screen name="Result" component={ResultScreen} options={{
          title: 'Meeting Insights',
        }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{
          title: 'Meeting History',
        }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
};

export default App;

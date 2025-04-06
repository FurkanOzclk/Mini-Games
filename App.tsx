import React from 'react';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import {
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack';

import HomeScreen from './src/screens/HomeScreen';
import MemoryGame from './src/screens/MemoryGame';
import SnakeGame from './src/screens/SnakeGame';
import TicTacToe from './src/screens/TicTacToe';
import Game2048 from './src/screens/Game2048';
import WordPuzzle from './src/screens/WordPuzzle';

const Stack = createStackNavigator();

// Default navigation options
const screenOptions: StackNavigationOptions = {
  headerStyle: {
    backgroundColor: '#2196F3',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={screenOptions}>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Mini Games' }} />
        <Stack.Screen name="MemoryGame" component={MemoryGame} options={{ title: 'Memory Game' }} />
        <Stack.Screen name="SnakeGame" component={SnakeGame} options={{ title: 'Snake Game' }} />
        <Stack.Screen name="TicTacToe" component={TicTacToe} options={{ title: 'Tic Tac Toe' }} />
        <Stack.Screen name="Game2048" component={Game2048} options={{ title: '2048' }} />
        <Stack.Screen name="WordPuzzle" component={WordPuzzle} options={{ title: 'Word Puzzle' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


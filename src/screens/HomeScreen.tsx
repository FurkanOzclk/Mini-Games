import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Game menu item type
interface GameMenuItem {
  title: string;
  screen: string;
  color: string;
  description: string;
}

// Game menu data
const gameMenu: GameMenuItem[] = [
  {
    title: 'Memory Card Game',
    screen: 'MemoryGame',
    color: '#FF9800',
    description: 'Test your memory by matching pairs of cards',
  },
  {
    title: 'Snake Game',
    screen: 'SnakeGame',
    color: '#4CAF50',
    description: 'Control the snake and eat as much food as possible',
  },
  {
    title: 'Tic Tac Toe',
    screen: 'TicTacToe',
    color: '#2196F3',
    description: 'Classic X and O game for two players or vs computer',
  },
  {
    title: '2048',
    screen: 'Game2048',
    color: '#FF5722',
    description: 'Merge tiles to reach the 2048 tile!',
  },
  {
    title: 'Word Puzzle',
    screen: 'WordPuzzle',
    color: '#9C27B0',
    description: 'Unscramble letters to form words and test your vocabulary',
  },
];

const HomeScreen = () => {
  const navigation = useNavigation();

  // Navigate to the selected game
  const navigateToGame = (screen: string) => {
    navigation.navigate(screen as never);
  };

  // Render a game menu item
  const renderGameItem = (item: GameMenuItem, index: number) => {
    return (
      <TouchableOpacity
        key={index}
        style={[styles.gameItem, { backgroundColor: item.color }]}
        onPress={() => navigateToGame(item.screen)}
      >
        <Text style={styles.gameTitle}>{item.title}</Text>
        <Text style={styles.gameDescription}>{item.description}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.header}>Choose a Game</Text>
          <View style={styles.gameList}>
            {gameMenu.map((item, index) => renderGameItem(item, index))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  gameList: {
    gap: 15,
  },
  gameItem: {
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  gameDescription: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
});

export default HomeScreen; 
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CARD_PAIRS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'
];

const MemoryGame = () => {
  const navigation = useNavigation();
  const [cards, setCards] = useState<string[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    initializeGame();
    loadBestScore();
  }, []);

  const loadBestScore = async () => {
    try {
      const savedBestScore = await AsyncStorage.getItem('memoryGameBestScore');
      if (savedBestScore !== null) {
        setBestScore(parseInt(savedBestScore, 10));
      }
    } catch (error) {
      console.log('Error loading best score:', error);
    }
  };

  const saveBestScore = async (score: number) => {
    try {
      if (bestScore === 0 || score < bestScore) {
        await AsyncStorage.setItem('memoryGameBestScore', score.toString());
        setBestScore(score);
      }
    } catch (error) {
      console.log('Error saving best score:', error);
    }
  };

  const initializeGame = () => {
    const duplicatedCards = [...CARD_PAIRS, ...CARD_PAIRS];
    const shuffledCards = duplicatedCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
  };

  const handleCardPress = (index: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(index) || matchedPairs.includes(index)) {
      return;
    }

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      const [first, second] = newFlippedCards;

      if (cards[first] === cards[second]) {
        setMatchedPairs(prev => [...prev, first, second]);
        setFlippedCards([]);

        if (matchedPairs.length + 2 === cards.length) {
          const finalScore = moves + 1;
          saveBestScore(finalScore);
          Alert.alert('Congratulations!', `You won in ${finalScore} moves!\nBest: ${bestScore > 0 && finalScore < bestScore ? finalScore : bestScore}`, [
            { text: 'Play Again', onPress: initializeGame },
            { text: 'Back to Home', onPress: () => navigation.goBack() }
          ]);
        }
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Memory Card Game</Text>
        
        <View style={styles.statsContainer}>
          <Text style={styles.moves}>Moves: {moves}</Text>
          <Text style={styles.bestScore}>Best Score: {bestScore > 0 ? bestScore : '-'}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.newGameButton} 
          onPress={initializeGame}
        >
          <Text style={styles.newGameButtonText}>New Game</Text>
        </TouchableOpacity>
        
        <View style={styles.grid}>
          {cards.map((card, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.card,
                flippedCards.includes(index) && styles.flippedCard,
                matchedPairs.includes(index) && styles.matchedCard
              ]}
              onPress={() => handleCardPress(index)}
            >
              <Text style={styles.cardText}>
                {flippedCards.includes(index) || matchedPairs.includes(index) ? card : '?'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  moves: {
    fontSize: 16,
    color: '#666',
  },
  bestScore: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: 'bold',
  },
  newGameButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 25,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  newGameButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  card: {
    width: 80,
    height: 80,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  flippedCard: {
    backgroundColor: '#2196F3',
  },
  matchedCard: {
    backgroundColor: '#9C27B0',
  },
  cardText: {
    fontSize: 32,
  }
});

export default MemoryGame; 
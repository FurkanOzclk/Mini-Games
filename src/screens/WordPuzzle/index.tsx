import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  FlatList,
  Dimensions,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const LETTER_SIZE = Math.floor(width * 0.12);
const WORD_BANK = [
  'REACT',
  'NATIVE',
  'JAVASCRIPT',
  'MOBILE',
  'FUNCTION',
  'COMPONENT',
  'STATE',
  'HOOK',
  'PROPS',
  'ASYNC',
  'PROMISE',
  'SWIFT',
  'KOTLIN',
  'FLUTTER',
  'ANDROID',
  'IPHONE',
  'XCODE',
  'STUDIO',
  'DEBUG',
  'RENDER',
];

// Game state
type GameState = {
  currentLevel: number;
  currentWord: string;
  scrambledWord: string;
  guessedLetters: string[];
  score: number;
  bestScore: number;
  attemptedWords: string[];
  remainingAttempts: number;
  completedLevels: number[];
};

const initialGameState: GameState = {
  currentLevel: 1,
  currentWord: '',
  scrambledWord: '',
  guessedLetters: [],
  score: 0,
  bestScore: 0,
  attemptedWords: [],
  remainingAttempts: 3,
  completedLevels: [],
};

const WordPuzzle = () => {
  const navigation = useNavigation();
  const [gameState, setGameState] = useState<GameState>({ ...initialGameState });
  const [selectedLetters, setSelectedLetters] = useState<number[]>([]);
  const [userInput, setUserInput] = useState('');
  
  // Initialize the game and load saved state
  useEffect(() => {
    loadGame();
    return () => {
      saveGame();
    };
  }, []);

  // Save game state when score or best score changes
  useEffect(() => {
    saveGame();
  }, [gameState.score, gameState.bestScore]);

  const loadGame = async () => {
    try {
      const savedGame = await AsyncStorage.getItem('wordPuzzleState');
      if (savedGame) {
        const parsedState = JSON.parse(savedGame);
        setGameState(parsedState);
        
        // If there is a current word, don't generate a new one
        if (!parsedState.currentWord) {
          generateNewWord(parsedState.completedLevels);
        }
      } else {
        // Start a new game if no saved state
        generateNewWord([]);
      }
    } catch (error) {
      console.log('Error loading game:', error);
      generateNewWord([]);
    }
  };

  const saveGame = async () => {
    try {
      await AsyncStorage.setItem('wordPuzzleState', JSON.stringify(gameState));
    } catch (error) {
      console.log('Error saving game:', error);
    }
  };

  // Scramble a word
  const scrambleWord = (word: string): string => {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    
    // Make sure the scrambled word is different from the original
    const scrambled = letters.join('');
    return scrambled === word ? scrambleWord(word) : scrambled;
  };

  // Generate a new word for the puzzle
  const generateNewWord = (completedLevels: number[]) => {
    // Filter out words that have already been completed
    const availableWords = WORD_BANK.filter((_, index) => !completedLevels.includes(index));
    
    // If all words have been completed, restart with all words
    const wordsToUse = availableWords.length > 0 ? availableWords : WORD_BANK;
    
    // Choose a random word
    const randomIndex = Math.floor(Math.random() * wordsToUse.length);
    const wordIndex = availableWords.length > 0 
      ? WORD_BANK.indexOf(wordsToUse[randomIndex])
      : randomIndex;
    const word = WORD_BANK[wordIndex];
    
    // Scramble the word
    const scrambled = scrambleWord(word);
    
    setGameState(prevState => ({
      ...prevState,
      currentWord: word,
      scrambledWord: scrambled,
      guessedLetters: [],
      currentLevel: completedLevels.length + 1,
      remainingAttempts: 3,
    }));
    
    setSelectedLetters([]);
    setUserInput('');
  };

  // Check if the user's guess is correct
  const checkGuess = () => {
    const guess = userInput.toUpperCase();
    
    if (guess.length < 2) {
      Alert.alert('Too Short', 'Please enter a word with at least 2 letters');
      return;
    }
    
    // Check if the word has already been attempted
    if (gameState.attemptedWords.includes(guess)) {
      Alert.alert('Already Tried', 'You have already tried this word');
      return;
    }
    
    // Add to attempted words
    const newAttemptedWords = [...gameState.attemptedWords, guess];
    
    // Check if the guess is correct
    if (guess === gameState.currentWord) {
      // Calculate score based on word length
      const wordScore = gameState.currentWord.length * 10;
      const newScore = gameState.score + wordScore;
      const newBestScore = Math.max(newScore, gameState.bestScore);
      
      // Add current level to completed levels
      const wordIndex = WORD_BANK.indexOf(gameState.currentWord);
      const newCompletedLevels = [...gameState.completedLevels, wordIndex];
      
      Alert.alert(
        'Correct!',
        `You've guessed the word correctly! +${wordScore} points`,
        [
          {
            text: 'Next Word',
            onPress: () => generateNewWord(newCompletedLevels),
          },
        ]
      );
      
      setGameState(prevState => ({
        ...prevState,
        score: newScore,
        bestScore: newBestScore,
        attemptedWords: newAttemptedWords,
        completedLevels: newCompletedLevels,
      }));
    } else {
      // Wrong guess
      const newRemainingAttempts = gameState.remainingAttempts - 1;
      
      if (newRemainingAttempts <= 0) {
        // Game over
        Alert.alert(
          'Game Over',
          `The word was "${gameState.currentWord}". Your final score: ${gameState.score}`,
          [
            {
              text: 'New Game',
              onPress: () => {
                setGameState(prevState => ({
                  ...initialGameState,
                  bestScore: prevState.bestScore,
                }));
                generateNewWord([]);
              },
            },
          ]
        );
      } else {
        // Still have attempts left
        Alert.alert(
          'Incorrect',
          `That's not the right word. ${newRemainingAttempts} ${
            newRemainingAttempts === 1 ? 'attempt' : 'attempts'
          } remaining.`
        );
        
        setGameState(prevState => ({
          ...prevState,
          remainingAttempts: newRemainingAttempts,
          attemptedWords: newAttemptedWords,
        }));
      }
    }
    
    setUserInput('');
    setSelectedLetters([]);
  };

  // Get a hint (reveal one letter)
  const getHint = () => {
    const { currentWord, guessedLetters } = gameState;
    
    // Find letters that haven't been revealed yet
    const unrevealedLetters = currentWord
      .split('')
      .map((letter, index) => ({ letter, index, position: currentWord.indexOf(letter) }))
      .filter(({ letter }) => !guessedLetters.includes(letter));
    
    if (unrevealedLetters.length === 0) {
      Alert.alert('No Hints Left', 'All letters have been revealed!');
      return;
    }
    
    // Sort by position in the word to get the first unrevealed letter
    unrevealedLetters.sort((a, b) => a.position - b.position);
    
    // Get the first unrevealed letter
    const { letter } = unrevealedLetters[0];
    
    // Add the letter to guessed letters
    const newGuessedLetters = [...guessedLetters, letter];
    
    // Update game state
    setGameState(prevState => ({
      ...prevState,
      guessedLetters: newGuessedLetters,
    }));
    
    // Set the hint letter in the text input
    setUserInput(letter);
    
    // Find the index of the letter in the scrambled word
    const letterIndex = gameState.scrambledWord.indexOf(letter);
    if (letterIndex !== -1) {
      setSelectedLetters([letterIndex]);
    }
  };

  // Skip the current word
  const skipWord = () => {
    Alert.alert(
      'Skip Word',
      'Are you sure you want to skip this word and go to the next one?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => generateNewWord(gameState.completedLevels),
        },
      ]
    );
  };

  // Reset the game
  const resetGame = () => {
    Alert.alert(
      'Reset Game',
      'Are you sure you want to reset the game? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            setGameState(prevState => ({
              ...initialGameState,
              bestScore: prevState.bestScore,
            }));
            generateNewWord([]);
          },
        },
      ]
    );
  };

  // Handle letter selection in scrambled word
  const handleLetterPress = (index: number) => {
    // If already selected, unselect
    if (selectedLetters.includes(index)) {
      setSelectedLetters(selectedLetters.filter(i => i !== index));
      setUserInput(userInput.slice(0, -1));
    } else {
      // Add to selected letters
      setSelectedLetters([...selectedLetters, index]);
      setUserInput(userInput + gameState.scrambledWord[index]);
    }
  };

  // Render scrambled letters
  const renderScrambledLetters = () => {
    return (
      <View style={styles.scrambledContainer}>
        {gameState.scrambledWord.split('').map((letter, index) => (
          <TouchableOpacity
            key={`${letter}-${index}`}
            style={[
              styles.letter,
              selectedLetters.includes(index) && styles.selectedLetter,
            ]}
            onPress={() => handleLetterPress(index)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.letterText,
              selectedLetters.includes(index) && styles.selectedLetterText,
            ]}>
              {letter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render user guess input field
  const renderGuessInput = () => {
    return (
      <View style={styles.guessContainer}>
        <TextInput
          style={styles.guessInput}
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Type your guess..."
          autoCapitalize="characters"
          maxLength={gameState.currentWord.length}
        />
        <TouchableOpacity
          style={styles.submitButton}
          onPress={checkGuess}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>Check</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render game header with score, level, etc.
  const renderGameHeader = () => {
    return (
      <View style={styles.gameHeader}>
        <View style={styles.levelContainer}>
          <Text style={styles.levelText}>Level {gameState.currentLevel}</Text>
          <Text style={styles.attemptsText}>
            Attempts: {gameState.remainingAttempts}
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>{gameState.score}</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Best</Text>
            <Text style={styles.scoreValue}>{gameState.bestScore}</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render helper buttons (hint, skip, reset)
  const renderHelperButtons = () => {
    return (
      <View style={styles.helperButtonsContainer}>
        <TouchableOpacity
          style={[styles.helperButton, { backgroundColor: '#4CAF50' }]}
          onPress={getHint}
          activeOpacity={0.7}
        >
          <Text style={styles.helperButtonText}>Hint</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.helperButton, { backgroundColor: '#FFC107' }]}
          onPress={skipWord}
          activeOpacity={0.7}
        >
          <Text style={styles.helperButtonText}>Skip</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.helperButton, { backgroundColor: '#F44336' }]}
          onPress={resetGame}
          activeOpacity={0.7}
        >
          <Text style={styles.helperButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render attempted words
  const renderAttemptedWords = () => {
    if (gameState.attemptedWords.length === 0) return null;
    
    return (
      <View style={styles.attemptedWordsContainer}>
        <Text style={styles.attemptedWordsTitle}>Attempted Words:</Text>
        <FlatList
          data={gameState.attemptedWords}
          renderItem={({ item }) => (
            <Text style={styles.attemptedWord}>{item}</Text>
          )}
          keyExtractor={(item, index) => `${item}-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.attemptedWordsList}
        />
      </View>
    );
  };

  // Render revealed letters (hints)
  const renderRevealedLetters = () => {
    if (gameState.guessedLetters.length === 0) return null;
    
    return (
      <View style={styles.revealedLettersContainer}>
        <Text style={styles.revealedLettersTitle}>Revealed Letters:</Text>
        <View style={styles.revealedLetters}>
          {gameState.guessedLetters.map((letter, index) => (
            <View key={`${letter}-${index}`} style={styles.revealedLetter}>
              <Text style={styles.revealedLetterText}>{letter}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {renderGameHeader()}
        
        <View style={styles.wordContainer}>
          <Text style={styles.instructions}>
            Unscramble the letters to form a word
          </Text>
          {renderScrambledLetters()}
        </View>
        
        {renderGuessInput()}
        
        {renderRevealedLetters()}
        
        {renderAttemptedWords()}
        
        {renderHelperButtons()}
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
    padding: 10,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  levelContainer: {
    flexDirection: 'column',
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  attemptsText: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  scoreContainer: {
    flexDirection: 'row',
  },
  scoreBox: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scoreValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  wordContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  instructions: {
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
    textAlign: 'center',
  },
  scrambledContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: width - 40,
  },
  letter: {
    width: LETTER_SIZE,
    height: LETTER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E1F5FE',
    borderRadius: 5,
    margin: 5,
    borderWidth: 1,
    borderColor: '#81D4FA',
  },
  selectedLetter: {
    backgroundColor: '#2196F3',
    borderColor: '#1565C0',
  },
  letterText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1565C0',
  },
  selectedLetterText: {
    color: 'white',
  },
  guessContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  guessInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginRight: 10,
  },
  submitButton: {
    height: 50,
    paddingHorizontal: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helperButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  helperButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  helperButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  attemptedWordsContainer: {
    marginTop: 10,
  },
  attemptedWordsTitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  attemptedWordsList: {
    paddingHorizontal: 10,
  },
  attemptedWord: {
    backgroundColor: '#BBDEFB',
    color: '#1565C0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
    fontWeight: 'bold',
  },
  revealedLettersContainer: {
    marginVertical: 10,
  },
  revealedLettersTitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  revealedLetters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  revealedLetter: {
    backgroundColor: '#C8E6C9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 5,
  },
  revealedLetterText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
});

export default WordPuzzle; 
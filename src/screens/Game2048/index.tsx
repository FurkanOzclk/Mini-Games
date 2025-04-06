import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Dimensions,
  GestureResponderEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const BOARD_SIZE = 4; // 4x4 grid
const CELL_SIZE = Math.floor(width * 0.8 / BOARD_SIZE);
const BOARD_WIDTH = CELL_SIZE * BOARD_SIZE;
const SWIPE_THRESHOLD = 50;

// Game state
type GameState = {
  board: number[][];
  score: number;
  bestScore: number;
  gameOver: boolean;
  hasWon: boolean;
};

const initialGameState: GameState = {
  board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0)),
  score: 0,
  bestScore: 0,
  gameOver: false,
  hasWon: false,
};

// Color mapping for different tile values
const tileColors: Record<number, string> = {
  0: '#CCC0B3',
  2: '#EEE4DA',
  4: '#EDE0C8',
  8: '#F2B179',
  16: '#F59563',
  32: '#F67C5F',
  64: '#F65E3B',
  128: '#EDCF72',
  256: '#EDCC61',
  512: '#EDC850',
  1024: '#EDC53F',
  2048: '#EDC22E',
};

// Text color mapping for different tile values
const textColors: Record<number, string> = {
  0: '#CCC0B3',
  2: '#776E65',
  4: '#776E65',
  8: '#F9F6F2',
  16: '#F9F6F2',
  32: '#F9F6F2',
  64: '#F9F6F2',
  128: '#F9F6F2',
  256: '#F9F6F2',
  512: '#F9F6F2',
  1024: '#F9F6F2',
  2048: '#F9F6F2',
};

const Game2048 = () => {
  const navigation = useNavigation();
  const [gameState, setGameState] = useState<GameState>({ ...initialGameState });
  const boardRef = useRef<View>(null);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  
  // Initialize the game and load saved state
  useEffect(() => {
    loadGame();
    return () => {
      saveGame();
    };
  }, []);

  // Save game state when component unmounts or when score/best score changes
  useEffect(() => {
    saveGame();
  }, [gameState.score, gameState.bestScore]);
  
  // Basitleştirilmiş kaydırma işlemi
  const handleTouch = {
    onTouchStart: (e: GestureResponderEvent) => {
      setStartX(e.nativeEvent.pageX);
      setStartY(e.nativeEvent.pageY);
    },
    onTouchEnd: (e: GestureResponderEvent) => {
      if (gameState.gameOver) return;
      
      const endX = e.nativeEvent.pageX;
      const endY = e.nativeEvent.pageY;
      
      const dx = endX - startX;
      const dy = endY - startY;
      
      // En az SWIPE_THRESHOLD kadar hareket olmalı
      if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;
      
      // Hangisi daha büyük: yatay hareket mi dikey hareket mi?
      if (Math.abs(dx) > Math.abs(dy)) {
        // Yatay hareket
        if (dx > 0) {
          moveRight();
        } else {
          moveLeft();
        }
      } else {
        // Dikey hareket
        if (dy > 0) {
          moveDown();
        } else {
          moveUp();
        }
      }
    }
  };

  const loadGame = async () => {
    try {
      const savedGame = await AsyncStorage.getItem('game2048State');
      if (savedGame) {
        const parsedState = JSON.parse(savedGame);
        
        // Eğer yüklenen board boşsa (ilk kurulumdan sonra durum olabilir)
        if (parsedState.board.every((row: number[]) => row.every((cell: number) => cell === 0))) {
          // Yeni bir oyun başlat
          initializeBoard();
        } else {
          setGameState(parsedState);
        }
      } else {
        // Start a new game if no saved state
        initializeBoard();
      }
    } catch (error) {
      console.log('Error loading game:', error);
      initializeBoard();
    }
  };

  const saveGame = async () => {
    try {
      await AsyncStorage.setItem('game2048State', JSON.stringify(gameState));
    } catch (error) {
      console.log('Error saving game:', error);
    }
  };

  // Initialize the board with two random tiles
  const initializeBoard = () => {
    const newBoard = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(0));
    
    // Add two random tiles
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    
    setGameState(prevState => ({
      ...prevState,
      board: newBoard,
      score: 0,
      gameOver: false,
      hasWon: false,
    }));
  };

  // Add a random tile (2 or 4) to an empty cell
  const addRandomTile = (board: number[][]) => {
    const emptyCells: [number, number][] = [];
    
    // Find all empty cells
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }
    
    if (emptyCells.length > 0) {
      // Choose a random empty cell
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      
      // 90% chance of 2, 10% chance of 4
      board[row][col] = Math.random() < 0.9 ? 2 : 4;
      return true;
    }
    return false;
  };

  // Check if the board is full and no moves are possible
  const checkGameOver = (board: number[][]) => {
    // Check if there are any empty cells
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j] === 0) {
          return false;
        }
      }
    }
    
    // Check if any adjacent cells have the same value
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const value = board[i][j];
        
        // Check right
        if (j < BOARD_SIZE - 1 && board[i][j + 1] === value) {
          return false;
        }
        
        // Check down
        if (i < BOARD_SIZE - 1 && board[i + 1][j] === value) {
          return false;
        }
      }
    }
    
    return true;
  };

  // Check if the player has won (reached 2048)
  const checkWin = (board: number[][]) => {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j] === 2048) {
          return true;
        }
      }
    }
    return false;
  };

  // Move functions
  const moveLeft = () => {
    const { board, score } = gameState;
    let newScore = score;
    let boardChanged = false;
    const newBoard = board.map(row => [...row]);
    
    for (let i = 0; i < BOARD_SIZE; i++) {
      // Merge tiles
      let lastMergePosition = -1;
      
      for (let j = 1; j < BOARD_SIZE; j++) {
        if (newBoard[i][j] === 0) continue;
        
        let movePosition = j;
        
        // Move left until we hit another tile or the edge
        while (movePosition > 0 && newBoard[i][movePosition - 1] === 0) {
          movePosition--;
        }
        
        // If we can merge with the tile to our left
        if (movePosition > 0 && newBoard[i][movePosition - 1] === newBoard[i][j] && movePosition - 1 > lastMergePosition) {
          newBoard[i][movePosition - 1] *= 2;
          newBoard[i][j] = 0;
          newScore += newBoard[i][movePosition - 1];
          lastMergePosition = movePosition - 1;
          boardChanged = true;
        }
        // Otherwise just move as far left as possible
        else if (movePosition !== j) {
          newBoard[i][movePosition] = newBoard[i][j];
          newBoard[i][j] = 0;
          boardChanged = true;
        }
      }
    }
    
    if (boardChanged) {
      // Add a new random tile
      addRandomTile(newBoard);
      
      // Check for win/game over
      const hasWon = checkWin(newBoard);
      const gameOver = checkGameOver(newBoard);
      
      // Update game state
      setGameState(prevState => ({
        ...prevState,
        board: newBoard,
        score: newScore,
        bestScore: Math.max(newScore, prevState.bestScore),
        gameOver,
        hasWon: prevState.hasWon || hasWon,
      }));
      
      // Show win alert if player just won
      if (hasWon && !gameState.hasWon) {
        setTimeout(() => {
          Alert.alert(
            'You Win!',
            'Congratulations! You reached 2048! You can continue playing to achieve a higher score.',
            [{ text: 'Continue', style: 'default' }]
          );
        }, 500);
      }
      
      // Show game over alert
      if (gameOver) {
        setTimeout(() => {
          Alert.alert(
            'Game Over',
            `Your score: ${newScore}`,
            [{ text: 'New Game', onPress: initializeBoard }]
          );
        }, 500);
      }
    }
  };

  const moveRight = () => {
    const { board, score } = gameState;
    let newScore = score;
    let boardChanged = false;
    const newBoard = board.map(row => [...row]);
    
    for (let i = 0; i < BOARD_SIZE; i++) {
      // Merge tiles
      let lastMergePosition = BOARD_SIZE;
      
      for (let j = BOARD_SIZE - 2; j >= 0; j--) {
        if (newBoard[i][j] === 0) continue;
        
        let movePosition = j;
        
        // Move right until we hit another tile or the edge
        while (movePosition < BOARD_SIZE - 1 && newBoard[i][movePosition + 1] === 0) {
          movePosition++;
        }
        
        // If we can merge with the tile to our right
        if (movePosition < BOARD_SIZE - 1 && newBoard[i][movePosition + 1] === newBoard[i][j] && movePosition + 1 < lastMergePosition) {
          newBoard[i][movePosition + 1] *= 2;
          newBoard[i][j] = 0;
          newScore += newBoard[i][movePosition + 1];
          lastMergePosition = movePosition + 1;
          boardChanged = true;
        }
        // Otherwise just move as far right as possible
        else if (movePosition !== j) {
          newBoard[i][movePosition] = newBoard[i][j];
          newBoard[i][j] = 0;
          boardChanged = true;
        }
      }
    }
    
    if (boardChanged) {
      // Add a new random tile
      addRandomTile(newBoard);
      
      // Check for win/game over
      const hasWon = checkWin(newBoard);
      const gameOver = checkGameOver(newBoard);
      
      // Update game state
      setGameState(prevState => ({
        ...prevState,
        board: newBoard,
        score: newScore,
        bestScore: Math.max(newScore, prevState.bestScore),
        gameOver,
        hasWon: prevState.hasWon || hasWon,
      }));
      
      // Show win alert if player just won
      if (hasWon && !gameState.hasWon) {
        setTimeout(() => {
          Alert.alert(
            'You Win!',
            'Congratulations! You reached 2048! You can continue playing to achieve a higher score.',
            [{ text: 'Continue', style: 'default' }]
          );
        }, 500);
      }
      
      // Show game over alert
      if (gameOver) {
        setTimeout(() => {
          Alert.alert(
            'Game Over',
            `Your score: ${newScore}`,
            [{ text: 'New Game', onPress: initializeBoard }]
          );
        }, 500);
      }
    }
  };

  const moveUp = () => {
    const { board, score } = gameState;
    let newScore = score;
    let boardChanged = false;
    const newBoard = board.map(row => [...row]);
    
    for (let j = 0; j < BOARD_SIZE; j++) {
      // Merge tiles
      let lastMergePosition = -1;
      
      for (let i = 1; i < BOARD_SIZE; i++) {
        if (newBoard[i][j] === 0) continue;
        
        let movePosition = i;
        
        // Move up until we hit another tile or the edge
        while (movePosition > 0 && newBoard[movePosition - 1][j] === 0) {
          movePosition--;
        }
        
        // If we can merge with the tile above
        if (movePosition > 0 && newBoard[movePosition - 1][j] === newBoard[i][j] && movePosition - 1 > lastMergePosition) {
          newBoard[movePosition - 1][j] *= 2;
          newBoard[i][j] = 0;
          newScore += newBoard[movePosition - 1][j];
          lastMergePosition = movePosition - 1;
          boardChanged = true;
        }
        // Otherwise just move as far up as possible
        else if (movePosition !== i) {
          newBoard[movePosition][j] = newBoard[i][j];
          newBoard[i][j] = 0;
          boardChanged = true;
        }
      }
    }
    
    if (boardChanged) {
      // Add a new random tile
      addRandomTile(newBoard);
      
      // Check for win/game over
      const hasWon = checkWin(newBoard);
      const gameOver = checkGameOver(newBoard);
      
      // Update game state
      setGameState(prevState => ({
        ...prevState,
        board: newBoard,
        score: newScore,
        bestScore: Math.max(newScore, prevState.bestScore),
        gameOver,
        hasWon: prevState.hasWon || hasWon,
      }));
      
      // Show win alert if player just won
      if (hasWon && !gameState.hasWon) {
        setTimeout(() => {
          Alert.alert(
            'You Win!',
            'Congratulations! You reached 2048! You can continue playing to achieve a higher score.',
            [{ text: 'Continue', style: 'default' }]
          );
        }, 500);
      }
      
      // Show game over alert
      if (gameOver) {
        setTimeout(() => {
          Alert.alert(
            'Game Over',
            `Your score: ${newScore}`,
            [{ text: 'New Game', onPress: initializeBoard }]
          );
        }, 500);
      }
    }
  };

  const moveDown = () => {
    const { board, score } = gameState;
    let newScore = score;
    let boardChanged = false;
    const newBoard = board.map(row => [...row]);
    
    for (let j = 0; j < BOARD_SIZE; j++) {
      // Merge tiles
      let lastMergePosition = BOARD_SIZE;
      
      for (let i = BOARD_SIZE - 2; i >= 0; i--) {
        if (newBoard[i][j] === 0) continue;
        
        let movePosition = i;
        
        // Move down until we hit another tile or the edge
        while (movePosition < BOARD_SIZE - 1 && newBoard[movePosition + 1][j] === 0) {
          movePosition++;
        }
        
        // If we can merge with the tile below
        if (movePosition < BOARD_SIZE - 1 && newBoard[movePosition + 1][j] === newBoard[i][j] && movePosition + 1 < lastMergePosition) {
          newBoard[movePosition + 1][j] *= 2;
          newBoard[i][j] = 0;
          newScore += newBoard[movePosition + 1][j];
          lastMergePosition = movePosition + 1;
          boardChanged = true;
        }
        // Otherwise just move as far down as possible
        else if (movePosition !== i) {
          newBoard[movePosition][j] = newBoard[i][j];
          newBoard[i][j] = 0;
          boardChanged = true;
        }
      }
    }
    
    if (boardChanged) {
      // Add a new random tile
      addRandomTile(newBoard);
      
      // Check for win/game over
      const hasWon = checkWin(newBoard);
      const gameOver = checkGameOver(newBoard);
      
      // Update game state
      setGameState(prevState => ({
        ...prevState,
        board: newBoard,
        score: newScore,
        bestScore: Math.max(newScore, prevState.bestScore),
        gameOver,
        hasWon: prevState.hasWon || hasWon,
      }));
      
      // Show win alert if player just won
      if (hasWon && !gameState.hasWon) {
        setTimeout(() => {
          Alert.alert(
            'You Win!',
            'Congratulations! You reached 2048! You can continue playing to achieve a higher score.',
            [{ text: 'Continue', style: 'default' }]
          );
        }, 500);
      }
      
      // Show game over alert
      if (gameOver) {
        setTimeout(() => {
          Alert.alert(
            'Game Over',
            `Your score: ${newScore}`,
            [{ text: 'New Game', onPress: initializeBoard }]
          );
        }, 500);
      }
    }
  };

  // Reset the game
  const resetGame = () => {
    // Confirm reset
    Alert.alert(
      'New Game',
      'Are you sure you want to start a new game?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'New Game', onPress: initializeBoard },
      ]
    );
  };

  // Render a single tile
  const renderTile = (value: number, row: number, col: number) => {
    const fontSize = value >= 1000 ? 24 : value >= 100 ? 28 : 32;
    
    return (
      <View
        key={`${row}-${col}`}
        style={[
          styles.tile,
          { backgroundColor: tileColors[value] || tileColors[2048] },
        ]}
      >
        {value > 0 && (
          <Text
            style={[
              styles.tileText,
              { color: textColors[value] || textColors[2048], fontSize },
            ]}
          >
            {value}
          </Text>
        )}
      </View>
    );
  };

  // Render the game board
  const renderBoard = () => {
    return (
      <View
        ref={boardRef}
        style={styles.boardContainer}
        onTouchStart={handleTouch.onTouchStart}
        onTouchEnd={handleTouch.onTouchEnd}
      >
        <View style={styles.board}>
          {gameState.board.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((cell, colIndex) => renderTile(cell, rowIndex, colIndex))}
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Render the score board
  const renderScoreBoard = () => {
    return (
      <View style={styles.scoreContainer}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue}>{gameState.score}</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>BEST</Text>
          <Text style={styles.scoreValue}>{gameState.bestScore}</Text>
        </View>
      </View>
    );
  };

  // Render instructions
  const renderInstructions = () => {
    return (
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Swipe to move tiles. Tiles with the same number merge into one when they touch.
          Add them up to reach 2048!
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>2048</Text>
          {renderScoreBoard()}
        </View>
        
        {renderBoard()}
        
        {renderInstructions()}
        
        <TouchableOpacity
          style={styles.newGameButton}
          onPress={resetGame}
          activeOpacity={0.7}
        >
          <Text style={styles.newGameButtonText}>New Game</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8EF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#776E65',
  },
  scoreContainer: {
    flexDirection: 'row',
  },
  scoreBox: {
    backgroundColor: '#BBADA0',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  scoreLabel: {
    color: '#EEE4DA',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scoreValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  boardContainer: {
    width: BOARD_WIDTH + 10,
    height: BOARD_WIDTH + 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#BBADA0',
    borderRadius: 5,
    padding: 5,
  },
  board: {
    width: BOARD_WIDTH,
    height: BOARD_WIDTH,
    backgroundColor: '#BBADA0',
    borderRadius: 5,
  },
  row: {
    flexDirection: 'row',
    height: CELL_SIZE,
  },
  tile: {
    width: CELL_SIZE - 8,
    height: CELL_SIZE - 8,
    margin: 4,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  instructionsText: {
    textAlign: 'center',
    color: '#776E65',
    fontSize: 16,
  },
  newGameButton: {
    backgroundColor: '#8F7A66',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  newGameButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Game2048; 
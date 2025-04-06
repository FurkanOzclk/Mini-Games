import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Dimensions,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const BOARD_SIZE = 3; // 3x3 grid
const CELL_SIZE = Math.floor(width * 0.8 / BOARD_SIZE);
const BOARD_WIDTH = CELL_SIZE * BOARD_SIZE;

// Possible players
type Player = 'X' | 'O' | null;

// Game modes
type GameMode = 'TWO_PLAYERS' | 'VS_COMPUTER';

// User choice
type UserChoice = 'X' | 'O';

// Game state
type GameState = {
  board: Player[][];
  currentPlayer: Player;
  winner: Player;
  winningLine: number[][] | null;
  gameOver: boolean;
  gameMode: GameMode;
  userChoice: UserChoice;
  xWins: number;
  oWins: number;
  draws: number;
};

const initialGameState: GameState = {
  board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
  currentPlayer: 'X',
  winner: null,
  winningLine: null,
  gameOver: false,
  gameMode: 'TWO_PLAYERS',
  userChoice: 'X',
  xWins: 0,
  oWins: 0,
  draws: 0,
};

// Winning combinations (rows, columns, diagonals)
const winningCombinations = [
  // Rows
  [[0, 0], [0, 1], [0, 2]],
  [[1, 0], [1, 1], [1, 2]],
  [[2, 0], [2, 1], [2, 2]],
  // Columns
  [[0, 0], [1, 0], [2, 0]],
  [[0, 1], [1, 1], [2, 1]],
  [[0, 2], [1, 2], [2, 2]],
  // Diagonals
  [[0, 0], [1, 1], [2, 2]],
  [[0, 2], [1, 1], [2, 0]],
];

const TicTacToe = () => {
  const navigation = useNavigation();
  const [gameState, setGameState] = useState<GameState>({ ...initialGameState });
  const [showSymbolModal, setShowSymbolModal] = useState(false);
  
  useEffect(() => {
    loadStats();
    return () => {
      saveStats();
    };
  }, []);

  // Save game statistics when unmounting
  useEffect(() => {
    return () => {
      saveStats();
    };
  }, [gameState.xWins, gameState.oWins, gameState.draws]);

  // Make computer move if it's computer's turn
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (
      gameState.gameMode === 'VS_COMPUTER' &&
      !gameState.gameOver &&
      gameState.currentPlayer !== gameState.userChoice
    ) {
      // Use a very short delay
      timer = setTimeout(() => {
        // Find smart move for computer
        const { board } = gameState;
        const computerSymbol = gameState.currentPlayer;
        const playerSymbol = computerSymbol === 'X' ? 'O' : 'X';
        
        // 1. Check if computer can win
        for (let i = 0; i < BOARD_SIZE; i++) {
          for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === null) {
              // Try this move
              const testBoard = board.map(row => [...row]);
              testBoard[i][j] = computerSymbol;
              
              // Check if this is a winning move
              if (checkWinner(testBoard).winner === computerSymbol) {
                // Make the winning move
                makeMove(i, j);
                return;
              }
            }
          }
        }
        
        // 2. Check if player can win and block
        for (let i = 0; i < BOARD_SIZE; i++) {
          for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === null) {
              // Try this move for player
              const testBoard = board.map(row => [...row]);
              testBoard[i][j] = playerSymbol;
              
              // Check if player would win with this move
              if (checkWinner(testBoard).winner === playerSymbol) {
                // Block the player
                makeMove(i, j);
                return;
              }
            }
          }
        }
        
        // 3. Take center if available
        if (board[1][1] === null) {
          makeMove(1, 1);
          return;
        }
        
        // 4. Take a corner if available
        const corners = [
          {row: 0, col: 0},
          {row: 0, col: 2},
          {row: 2, col: 0},
          {row: 2, col: 2}
        ];
        
        const availableCorners = corners.filter(({row, col}) => board[row][col] === null);
        if (availableCorners.length > 0) {
          const {row, col} = availableCorners[Math.floor(Math.random() * availableCorners.length)];
          makeMove(row, col);
          return;
        }
        
        // 5. Take any available spot
        const emptyCells: { row: number, col: number }[] = [];
        for (let i = 0; i < BOARD_SIZE; i++) {
          for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === null) {
              emptyCells.push({ row: i, col: j });
            }
          }
        }

        if (emptyCells.length > 0) {
          const {row, col} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
          makeMove(row, col);
        }
      }, 300); // A small delay to make it look like the computer is thinking
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameState.currentPlayer, gameState.gameMode, gameState.gameOver, gameState.userChoice]);

  // Helper function for computer to make a move
  const makeMove = (row: number, col: number) => {
    const { board, currentPlayer } = gameState;
    
    // Create a new board with the move
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    
    // Check for winner or draw
    const { winner, winningLine } = checkWinner(newBoard);
    const isDraw = !winner && checkDraw(newBoard);
    
    let newXWins = gameState.xWins;
    let newOWins = gameState.oWins;
    let newDraws = gameState.draws;
    
    if (winner) {
      if (winner === 'X') {
        newXWins++;
      } else {
        newOWins++;
      }
    } else if (isDraw) {
      newDraws++;
    }
    
    // Update game state directly
    setGameState({
      ...gameState,
      board: newBoard,
      currentPlayer: currentPlayer === 'X' ? 'O' : 'X',
      winner,
      winningLine,
      gameOver: winner !== null || isDraw,
      xWins: newXWins,
      oWins: newOWins,
      draws: newDraws,
    });
    
    // Show game over alert
    if (winner || isDraw) {
      const message = winner 
        ? `Player ${winner} wins!` 
        : "It's a draw!";
        
      setTimeout(() => {
        Alert.alert(
          'Game Over', 
          message, 
          [
            { 
              text: 'Play Again', 
              onPress: resetGame 
            },
          ]
        );
      }, 500);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await AsyncStorage.getItem('ticTacToeStats');
      if (stats) {
        const { xWins, oWins, draws } = JSON.parse(stats);
        setGameState(prev => ({
          ...prev,
          xWins: xWins || 0,
          oWins: oWins || 0,
          draws: draws || 0,
        }));
      }
    } catch (error) {
      console.log('Error loading stats:', error);
    }
  };

  const saveStats = async () => {
    try {
      const stats = {
        xWins: gameState.xWins,
        oWins: gameState.oWins,
        draws: gameState.draws,
      };
      await AsyncStorage.setItem('ticTacToeStats', JSON.stringify(stats));
    } catch (error) {
      console.log('Error saving stats:', error);
    }
  };

  const handleCellPress = (row: number, col: number) => {
    const { board, currentPlayer, gameOver, gameMode, userChoice } = gameState;

    // Do nothing if cell is already occupied or game is over
    if (board[row][col] !== null || gameOver) {
      return;
    }

    // In VS_COMPUTER mode, make sure it's user's turn
    if (gameMode === 'VS_COMPUTER' && currentPlayer !== userChoice) {
      return;
    }

    // Update board with current player's move
    const newBoard = [...board.map(row => [...row])];
    newBoard[row][col] = currentPlayer;

    // Check for winner or draw
    const { winner, winningLine } = checkWinner(newBoard);
    const isDraw = !winner && checkDraw(newBoard);
    
    let newXWins = gameState.xWins;
    let newOWins = gameState.oWins;
    let newDraws = gameState.draws;
    
    if (winner) {
      if (winner === 'X') {
        newXWins++;
      } else {
        newOWins++;
      }
    } else if (isDraw) {
      newDraws++;
    }

    // Update game state
    setGameState({
      ...gameState,
      board: newBoard,
      currentPlayer: currentPlayer === 'X' ? 'O' : 'X',
      winner,
      winningLine,
      gameOver: winner !== null || isDraw,
      xWins: newXWins,
      oWins: newOWins,
      draws: newDraws,
    });
    
    // Show game over alert
    if (winner || isDraw) {
      const message = winner 
        ? `Player ${winner} wins!` 
        : "It's a draw!";
        
      setTimeout(() => {
        Alert.alert(
          'Game Over', 
          message, 
          [
            { 
              text: 'Play Again', 
              onPress: resetGame 
            },
          ]
        );
      }, 500);
    }
  };

  const makeComputerMove = () => {
    // This function is now handled by the useEffect
    console.log("Computer's move is now handled by useEffect");
  };

  const checkWinner = (board: Player[][]) => {
    for (const combination of winningCombinations) {
      const [[r1, c1], [r2, c2], [r3, c3]] = combination;
      
      if (
        board[r1][c1] !== null &&
        board[r1][c1] === board[r2][c2] &&
        board[r1][c1] === board[r3][c3]
      ) {
        return { 
          winner: board[r1][c1], 
          winningLine: combination 
        };
      }
    }
    
    return { winner: null, winningLine: null };
  };

  const checkDraw = (board: Player[][]) => {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j] === null) {
          return false;
        }
      }
    }
    return true;
  };

  const resetGame = () => {
    const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: 'X',
      winner: null,
      winningLine: null,
      gameOver: false,
    }));
  };

  const toggleGameMode = () => {
    if (gameState.gameMode === 'TWO_PLAYERS') {
      // Switching to VS_COMPUTER mode
      setShowSymbolModal(true);
    } else {
      // Switching to TWO_PLAYERS mode
      setGameState(prev => ({
        ...prev,
        gameMode: 'TWO_PLAYERS',
      }));
      resetGame();
    }
  };

  const selectSymbol = (symbol: UserChoice) => {
    setGameState(prev => ({
      ...prev,
      gameMode: 'VS_COMPUTER',
      userChoice: symbol,
    }));
    setShowSymbolModal(false);
    
    // Reset the game and make computer move if computer goes first
    setTimeout(() => {
      resetGame();
    }, 100);
  };

  const resetStats = () => {
    Alert.alert(
      'Reset Statistics',
      'Are you sure you want to reset all game statistics?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setGameState(prev => ({
              ...prev,
              xWins: 0,
              oWins: 0,
              draws: 0,
            }));
          }
        },
      ]
    );
  };

  const renderCell = (row: number, col: number) => {
    const cellValue = gameState.board[row][col];
    const isWinningCell = gameState.winningLine?.some(
      ([r, c]) => r === row && c === col
    );

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[
          styles.cell,
          isWinningCell && styles.winningCell,
        ]}
        onPress={() => handleCellPress(row, col)}
        activeOpacity={0.7}
      >
        {cellValue && (
          <Text 
            style={[
              styles.cellText, 
              cellValue === 'X' ? styles.xText : styles.oText,
              isWinningCell && styles.winningCellText,
            ]}
          >
            {cellValue}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderBoard = () => {
    return (
      <View style={styles.board}>
        {Array(BOARD_SIZE).fill(null).map((_, row) => (
          <View key={`row-${row}`} style={styles.row}>
            {Array(BOARD_SIZE).fill(null).map((_, col) => renderCell(row, col))}
          </View>
        ))}
      </View>
    );
  };

  const renderCurrentPlayer = () => {
    const { gameOver, winner, currentPlayer, gameMode, userChoice } = gameState;
    
    let statusText = '';
    
    if (gameOver) {
      statusText = winner ? `Player ${winner} wins!` : "It's a draw!";
    } else if (gameMode === 'VS_COMPUTER') {
      statusText = currentPlayer === userChoice ? 'Your turn' : 'Computer\'s turn';
    } else {
      statusText = `Current Player: `;
    }
    
    return (
      <View style={styles.currentPlayerContainer}>
        <Text style={styles.currentPlayerText}>
          {statusText}
        </Text>
        {!gameOver && gameMode === 'TWO_PLAYERS' && (
          <Text 
            style={[
              styles.playerIndicator,
              currentPlayer === 'X' ? styles.xText : styles.oText
            ]}
          >
            {currentPlayer}
          </Text>
        )}
        {!gameOver && gameMode === 'VS_COMPUTER' && (
          <Text 
            style={[
              styles.playerIndicator,
              currentPlayer === 'X' ? styles.xText : styles.oText
            ]}
          >
            {currentPlayer === userChoice ? ` (${currentPlayer})` : ''}
          </Text>
        )}
      </View>
    );
  };

  const renderStats = () => {
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.xText]}>{gameState.xWins}</Text>
          <Text style={styles.statLabel}>X Wins</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{gameState.draws}</Text>
          <Text style={styles.statLabel}>Draws</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.oText]}>{gameState.oWins}</Text>
          <Text style={styles.statLabel}>O Wins</Text>
        </View>
      </View>
    );
  };

  const renderSymbolModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSymbolModal}
        onRequestClose={() => setShowSymbolModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Your Symbol</Text>
            
            <View style={styles.symbolButtons}>
              <TouchableOpacity
                style={[styles.symbolButton, styles.xButton]}
                onPress={() => selectSymbol('X')}
              >
                <Text style={[styles.symbolButtonText, styles.xText]}>X</Text>
                <Text style={styles.symbolButtonLabel}>You go first</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.symbolButton, styles.oButton]}
                onPress={() => selectSymbol('O')}
              >
                <Text style={[styles.symbolButtonText, styles.oText]}>O</Text>
                <Text style={styles.symbolButtonLabel}>Computer goes first</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowSymbolModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Tic Tac Toe</Text>
        
        {renderCurrentPlayer()}
        
        {renderBoard()}
        
        <View style={styles.bottomContainer}>
          {renderStats()}
          
          <View style={styles.gameInfo}>
            {gameState.gameMode === 'VS_COMPUTER' && (
              <Text style={styles.gameInfoText}>
                You are playing as{' '}
                <Text style={gameState.userChoice === 'X' ? styles.xText : styles.oText}>
                  {gameState.userChoice}
                </Text>
              </Text>
            )}
          </View>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={resetGame}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>New Game</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: '#9C27B0' }]} 
              onPress={toggleGameMode}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>
                {gameState.gameMode === 'TWO_PLAYERS' ? 'Play vs Computer' : 'Two Players'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: '#FF9800' }]} 
              onPress={resetStats}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Reset Stats</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {renderSymbolModal()}
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
    alignItems: 'center',
    padding: 10,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#333',
  },
  currentPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  currentPlayerText: {
    fontSize: 18,
    color: '#555',
  },
  playerIndicator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  board: {
    width: BOARD_WIDTH,
    height: BOARD_WIDTH,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 5,
    marginVertical: 10,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    height: CELL_SIZE,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  winningCell: {
    backgroundColor: '#E8F5E9',
  },
  cellText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  winningCellText: {
    color: '#2E7D32',
  },
  xText: {
    color: '#F44336',
  },
  oText: {
    color: '#2196F3',
  },
  bottomContainer: {
    width: '100%',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: '5%',
    marginVertical: 5,
    paddingVertical: 10,
    backgroundColor: '#EEEEEE',
    borderRadius: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#555',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  gameInfo: {
    marginVertical: 5,
    alignItems: 'center',
  },
  gameInfoText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 25,
    width: '80%',
    marginBottom: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  symbolButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  symbolButton: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xButton: {
    backgroundColor: '#FFEBEE',
    borderWidth: 2,
    borderColor: '#F44336',
  },
  oButton: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  symbolButtonText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  symbolButtonLabel: {
    fontSize: 12,
    color: '#666',
  },
  cancelButton: {
    padding: 10,
    width: '60%',
    borderRadius: 25,
    backgroundColor: '#EEEEEE',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default TicTacToe; 
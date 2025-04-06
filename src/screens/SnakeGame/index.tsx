import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Dimensions,
  PanResponder,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const GRID_SIZE = 15;
const CELL_SIZE = Math.floor(width * 0.9 / GRID_SIZE);
const GRID_WIDTH = CELL_SIZE * GRID_SIZE;
const GRID_HEIGHT = CELL_SIZE * GRID_SIZE;

// Directions
enum Direction {
  UP = 'UP',
  RIGHT = 'RIGHT',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
}

type Position = {
  x: number;
  y: number;
};

const SnakeGame = () => {
  const navigation = useNavigation();
  const [snake, setSnake] = useState<Position[]>([{ x: 5, y: 5 }]);
  const [food, setFood] = useState<Position>({ x: 10, y: 10 });
  const [direction, setDirection] = useState<Direction>(Direction.RIGHT);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameInterval = useRef<NodeJS.Timeout | null>(null);
  const speed = useRef(150); // Initial speed in milliseconds
  const scoreRef = useRef(0); // Ref to track score for moveSnake function
  const currentDirection = useRef<Direction>(Direction.RIGHT);
  const foodRef = useRef<Position>({ x: 10, y: 10 });
  const isPausedRef = useRef(false); // Use ref to track pause state in interval

  // Update the refs when states change
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    currentDirection.current = direction;
  }, [direction]);
  
  useEffect(() => {
    foodRef.current = food;
  }, [food]);
  
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    loadHighScore();
    startGame();
    return () => {
      stopGameInterval();
    };
  }, []);

  const loadHighScore = async () => {
    try {
      const savedHighScore = await AsyncStorage.getItem('snakeGameHighScore');
      if (savedHighScore !== null) {
        setHighScore(parseInt(savedHighScore, 10));
      }
    } catch (error) {
      console.log('Error loading high score:', error);
    }
  };

  const saveHighScore = async (score: number) => {
    try {
      if (score > highScore) {
        await AsyncStorage.setItem('snakeGameHighScore', score.toString());
        setHighScore(score);
      }
    } catch (error) {
      console.log('Error saving high score:', error);
    }
  };

  const startGameInterval = () => {
    stopGameInterval(); // Always clear existing interval first
    gameInterval.current = setInterval(moveSnake, speed.current);
  };

  const stopGameInterval = () => {
    if (gameInterval.current) {
      clearInterval(gameInterval.current);
      gameInterval.current = null;
    }
  };

  const startGame = () => {
    const initialSnake = [{ x: 5, y: 5 }];
    const initialFood = generateFoodPosition(initialSnake);
    
    setSnake(initialSnake);
    setFood(initialFood);
    foodRef.current = initialFood;
    
    setDirection(Direction.RIGHT);
    currentDirection.current = Direction.RIGHT;
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    isPausedRef.current = false;
    speed.current = 200;

    stopGameInterval();
    startGameInterval();
  };

  const generateFoodPosition = (snakeBody: Position[]): Position => {
    const newFood: Position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };

    // Check if the food is on the snake's body
    const isOnSnake = snakeBody.some(
      segment => segment.x === newFood.x && segment.y === newFood.y
    );

    if (isOnSnake) {
      return generateFoodPosition(snakeBody);
    }

    return newFood;
  };

  const moveSnake = () => {
    if (isPausedRef.current || isGameOver) return;

    setSnake(currentSnake => {
      const head = { ...currentSnake[0] };
      const dir = currentDirection.current;

      // Move the head based on the current direction
      switch (dir) {
        case Direction.UP:
          head.y -= 1;
          break;
        case Direction.RIGHT:
          head.x += 1;
          break;
        case Direction.DOWN:
          head.y += 1;
          break;
        case Direction.LEFT:
          head.x -= 1;
          break;
      }

      // Check for collisions with walls
      if (
        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE
      ) {
        handleGameOver();
        return currentSnake;
      }

      // Check for collision with itself
      const isSelfCollision = currentSnake.some(
        (segment, index) => index !== 0 && segment.x === head.x && segment.y === head.y
      );

      if (isSelfCollision) {
        handleGameOver();
        return currentSnake;
      }

      // Create new snake with the new head
      const newSnake = [head, ...currentSnake];
      
      // Check if snake eats food
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        // Increase score
        const newScore = scoreRef.current + 1;
        setScore(newScore);
        
        // Generate new food position
        const newFood = generateFoodPosition(newSnake);
        setFood(newFood);
        foodRef.current = newFood;
        
        // Increase speed
        if (newScore % 5 === 0 && speed.current > 50) {
          speed.current -= 20;
          stopGameInterval();
          startGameInterval();
        }
        
        return newSnake; // Keep the tail (snake grows)
      } else {
        // Remove the tail if no food was eaten
        newSnake.pop();
        return newSnake;
      }
    });
  };

  const handleGameOver = () => {
    stopGameInterval();
    setIsGameOver(true);
    
    const finalScore = scoreRef.current;
    saveHighScore(finalScore);
    
    Alert.alert(
      'Game Over',
      `Your score: ${finalScore}\nHigh Score: ${Math.max(finalScore, highScore)}`,
      [
        { text: 'Play Again', onPress: startGame },
        { text: 'Back to Home', onPress: () => navigation.goBack() }
      ]
    );
  };

  const togglePause = () => {
    if (isGameOver) return; // Do nothing if game is over
    
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    isPausedRef.current = newPausedState;
    
    if (newPausedState) {
      // Pause game
      stopGameInterval();
    } else {
      // Resume game
      startGameInterval();
    }
  };

  const handleDirectionChange = (newDirection: Direction) => {
    // Prevent 180-degree turns
    const dir = currentDirection.current;
    
    if (
      (newDirection === Direction.UP && dir !== Direction.DOWN) ||
      (newDirection === Direction.DOWN && dir !== Direction.UP) ||
      (newDirection === Direction.LEFT && dir !== Direction.RIGHT) ||
      (newDirection === Direction.RIGHT && dir !== Direction.LEFT)
    ) {
      setDirection(newDirection);
      currentDirection.current = newDirection;
    }
  };

  const onPressUp = () => {
    if (!isPaused && !isGameOver) {
      handleDirectionChange(Direction.UP);
    }
  };

  const onPressDown = () => {
    if (!isPaused && !isGameOver) {
      handleDirectionChange(Direction.DOWN);
    }
  };

  const onPressLeft = () => {
    if (!isPaused && !isGameOver) {
      handleDirectionChange(Direction.LEFT);
    }
  };

  const onPressRight = () => {
    if (!isPaused && !isGameOver) {
      handleDirectionChange(Direction.RIGHT);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        const { dx, dy } = gestureState;
        
        // Only respond to significant movements
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        
        // Determine the direction based on the gesture
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal movement
          if (dx > 0 && currentDirection.current !== Direction.LEFT) {
            handleDirectionChange(Direction.RIGHT);
          } else if (dx < 0 && currentDirection.current !== Direction.RIGHT) {
            handleDirectionChange(Direction.LEFT);
          }
        } else {
          // Vertical movement
          if (dy > 0 && currentDirection.current !== Direction.UP) {
            handleDirectionChange(Direction.DOWN);
          } else if (dy < 0 && currentDirection.current !== Direction.DOWN) {
            handleDirectionChange(Direction.UP);
          }
        }
      },
    })
  ).current;

  const renderGrid = () => {
    return (
      <View 
        style={styles.grid}
        {...panResponder.panHandlers}
      >
        {renderFood()}
        {renderSnake()}
      </View>
    );
  };

  const renderSnake = () => {
    return snake.map((segment, index) => (
      <View
        key={`snake-${index}`}
        style={[
          styles.snakeSegment,
          {
            left: segment.x * CELL_SIZE,
            top: segment.y * CELL_SIZE,
            backgroundColor: index === 0 ? '#388E3C' : '#4CAF50', // Head is darker
          },
        ]}
      />
    ));
  };

  const renderFood = () => {
    return (
      <View
        style={[
          styles.food,
          {
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
          },
        ]}
      />
    );
  };

  const renderControls = () => {
    return (
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onPressUp}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>↑</Text>
        </TouchableOpacity>
        <View style={styles.middleControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onPressLeft}
            activeOpacity={0.7}
          >
            <Text style={styles.controlButtonText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onPressRight}
            activeOpacity={0.7}
          >
            <Text style={styles.controlButtonText}>→</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onPressDown}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>↓</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Snake Game</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.score}>Score: {score}</Text>
          <Text style={styles.highScore}>High Score: {Math.max(score, highScore)}</Text>
        </View>
        <View style={styles.gameContainer}>
          {renderGrid()}
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={startGame}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>New Game</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, isPaused ? styles.resumeButton : styles.pauseButton]} 
            onPress={togglePause}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>{isPaused ? 'Resume' : 'Pause'}</Text>
          </TouchableOpacity>
        </View>
        {renderControls()}
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
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: '5%',
    marginBottom: 10,
  },
  score: {
    fontSize: 16,
    color: '#666',
  },
  highScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
  },
  gameContainer: {
    width: GRID_WIDTH,
    height: GRID_HEIGHT,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    width: GRID_WIDTH,
    height: GRID_HEIGHT,
    backgroundColor: '#EEEEEE',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    position: 'relative',
  },
  snakeSegment: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    position: 'absolute',
    borderRadius: 2,
  },
  food: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: '#F44336',
    position: 'absolute',
    borderRadius: CELL_SIZE / 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 25,
    width: '45%',
  },
  pauseButton: {
    backgroundColor: '#FF9800',
  },
  resumeButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  controlsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  middleControls: {
    flexDirection: 'row',
    width: '60%',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  controlButton: {
    width: 60,
    height: 60,
    backgroundColor: '#9E9E9E',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SnakeGame;
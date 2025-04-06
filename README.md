# Mini-Games

Mini-Games is a mobile application collection developed with React Native, featuring five different games. The games offer simple and fun interfaces, providing users with an enjoyable experience.

## Features

- **Modern and user-friendly interface**
- **Five different games in one application:**
  - Memory Card Game
  - Snake Game
  - Tic Tac Toe
  - 2048
  - Word Puzzle
- **High score and statistics tracking**
- **Progress saving with AsyncStorage**

## Games

### Memory Card Game
Test your memory! Flip cards to find matching pairs and try to find all matches with the fewest moves possible.

### Snake Game
The classic snake game: Control your snake to collect food and try to achieve the highest score without hitting walls or yourself.

### Tic Tac Toe
Classic two-player X and O game or play against the computer. You can choose X or O when playing against the computer.

### 2048
Try to reach the 2048 tile by combining tiles of the same number. Swipe the screen to move tiles and make strategic moves.

### Word Puzzle
Form meaningful words from scrambled letters. You can get hints and use your limited attempts to find words.

## Installation and Setup

Follow these steps to run the Mini-Games application on your device:

```bash
# Clone the repository
git clone https://github.com/FurkanOzclk/Mini-Games.git

# Navigate to the project directory
cd Mini-Games

# Install dependencies
npm install

# Install Expo CLI globally (if not already installed)
npm install -g expo-cli

# Start the application
npx expo start
```

After starting the application, you'll see a QR code in your terminal. You have multiple options to run the app:

- **For iOS users**: Scan the QR code using your iPhone camera app
- **For Android users**: Install the Expo Go app from Google Play Store, then scan the QR code within the app
- **On Emulator/Simulator**: Press `i` in the terminal to open in iOS simulator, or `a` for Android emulator (these must be installed)
- **Web Version**: Press `w` to run in web browser (with limited functionality)

## Development

This project was developed using React Native and Expo. The game code is located in the `src/screens` directory.

### Project Structure
```
mini-games/
├── App.tsx                # Main app component and navigation setup
├── src/
│   ├── screens/           # Individual game screens
│   │   ├── HomeScreen.tsx # Main menu to select games 
│   │   ├── MemoryGame/    # Memory Card Game files
│   │   ├── SnakeGame/     # Snake Game files
│   │   ├── TicTacToe/     # Tic Tac Toe game files
│   │   ├── Game2048/      # 2048 game files
│   │   └── WordPuzzle/    # Word Puzzle game files
│   ├── components/        # Reusable UI components
│   └── utils/             # Utility functions
└── package.json           # Dependencies and scripts
```

### Technologies Used

- React Native
- Expo
- React Navigation
- AsyncStorage

## Screenshots

From the main screen, you can select a game and play in each game's own interface. Your progress in the games is automatically saved.

## License

This project is open source and shared under the MIT license.

## Contact

For questions or feedback, you can reach out via GitHub.

---

Developer: [Furkan Özçelik](https://github.com/FurkanOzclk) 
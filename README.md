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
│   │   ├── MemoryGame/    # Memory Card Game files![WordPuzzle](https://github.com/user-attachments/assets/cf9f403b-ec5a-4aa8-bea7-72b1571bf8bb)

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

![Main](https://github.com/user-attachments/assets/b4c7777d-8987-494b-a15a-4ef3203a9bdb)
![Memory](https://github.com/user-attachments/assets/f93ce8ad-70ae-4ac6-9c11-5eb7fb4812fc)
![Snake](https://github.com/user-attachments/assets/d9659cda-1394-4047-b35f-3afb1ae8dd80)
![TicTacToe](https://github.com/user-attachments/assets/e3184bef-28c4-4598-b7e3-5720cb53c2ea)
![2048](https://github.com/user-attachments/assets/7982e21c-abde-4abb-8606-7b148eabaabd)
![WordPuzzle](https://github.com/user-attachments/assets/6bd74a03-a1f5-42ad-ab0b-86d7720bf992)


## License

This project is open source and shared under the MIT license.

## Contact

For questions or feedback, you can reach out via GitHub.

---

Developer: [Furkan Özçelik](https://github.com/FurkanOzclk) 

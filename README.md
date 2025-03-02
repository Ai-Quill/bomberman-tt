# Bomberman 3D

A 3D remake of the classic Bomberman game using Three.js.

## Overview

This project is a modern 3D interpretation of the classic Bomberman game. Players navigate through a grid-based level, placing bombs to destroy obstacles and defeat enemies. The game features multiple levels, power-ups, and a 3D environment.

## Features

- 3D graphics using Three.js
- Multiple levels with increasing difficulty
- Various enemy types
- Power-ups (bomb range, extra bombs, speed)
- Sound effects and background music
- Responsive controls

## How to Play

1. Open `index.html` in a modern web browser
2. Use WASD or arrow keys to move
3. Press Space to place bombs
4. Use the mouse to rotate the camera view
5. Destroy all enemies to complete a level
6. Collect power-ups to enhance your abilities

## Controls

- **Movement**: WASD or Arrow Keys
- **Place Bomb**: Space
- **Camera Rotation**: Mouse Drag
- **Reset Game**: Reset button in top-right corner
- **Toggle Sound**: Sound button in top-right corner

## Game Mechanics

- **Bombs**: Explode after a short delay, creating explosions in four directions
- **Breakable Blocks**: Can be destroyed by bombs and may contain power-ups
- **Walls**: Cannot be destroyed and block movement
- **Enemies**: Move around the level and can be defeated with bombs
- **Power-ups**:
  - **Range**: Increases explosion range
  - **Bomb**: Increases maximum number of bombs you can place at once
  - **Speed**: Increases movement speed

## Project Structure

- `index.html`: Main HTML file
- `js/Game.js`: Main game initialization and management
- `js/classes/`: Contains game entity classes (Player, Enemy, Bomb, etc.)
- `js/managers/`: Contains manager classes (Sound, Input, Level)
- `js/utils/`: Contains utility functions and helpers

## Technical Details

- Built with vanilla JavaScript and Three.js
- Uses ES6 modules for code organization
- Implements a grid-based system for game logic
- Uses Three.js for 3D rendering and camera controls

## Credits

- Three.js: https://threejs.org/
- Game assets created for this project

## License

This project is open source and available under the MIT License. 
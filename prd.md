# Bomberman 3D - Three.js Development Plan

## Project Overview
This document outlines a comprehensive development plan for creating a 3D Bomberman clone using the Three.js framework. The game will replicate the core mechanics of the classic Nintendo Bomberman while leveraging modern 3D graphics capabilities.

## Table of Contents
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Core Systems Design](#core-systems-design)
- [Game Mechanics](#game-mechanics)
- [Visual Implementation](#visual-implementation)
- [Asset Management](#asset-management)
- [Development Milestones](#development-milestones)
- [Performance Considerations](#performance-considerations)
- [Testing Strategy](#testing-strategy)

## Project Structure

```
bomberman-3d/
├── index.html                  # Entry point HTML
├── styles/                     # CSS styles
│   └── main.css
├── assets/                     # Game assets
│   ├── models/                 # 3D models
│   │   ├── characters/         # Player and enemy models
│   │   ├── environment/        # Level objects, blocks
│   │   ├── items/              # Bombs, power-ups
│   │   └── effects/            # Explosion effects
│   ├── textures/               # Texture maps
│   │   ├── diffuse/            # Color textures
│   │   ├── normal/             # Normal maps
│   │   └── specular/           # Specular maps
│   └── sounds/                 # Audio files
│       ├── music/              # Background music
│       └── sfx/                # Sound effects
└── src/                        # Source code
    ├── main.js                 # Application entry point
    ├── config.js               # Game configuration
    ├── engine/                 # Core engine components
    │   ├── gameLoop.js         # Main game loop
    │   ├── input.js            # Input handling
    │   ├── physics.js          # Collision detection
    │   ├── audio.js            # Sound system
    │   └── eventManager.js     # Event pub/sub system
    ├── game/                   # Game-specific logic
    │   ├── grid.js             # Grid system
    │   ├── player.js           # Player controls and states
    │   ├── bomb.js             # Bomb mechanics
    │   ├── explosion.js        # Explosion mechanics
    │   ├── enemy.js            # Enemy AI
    │   ├── powerUp.js          # Power-up system
    │   ├── level.js            # Level management
    │   └── gameState.js        # Game state management
    ├── rendering/              # Visual rendering
    │   ├── scene.js            # Three.js scene setup
    │   ├── camera.js           # Camera management
    │   ├── lighting.js         # Lighting system
    │   ├── effects.js          # Visual effects
    │   └── ui.js               # HUD and interface
    └── utils/                  # Utility functions
        ├── loaders.js          # Asset loading utilities
        ├── math.js             # Math helper functions
        └── helpers.js          # General helper functions
```

## Technology Stack

- **Core Framework**: Three.js (3D rendering)
- **Physics**: Custom grid-based collision system
- **Build Tools**: Vite (for fast development)
- **Asset Pipeline**: Replicate AI for asset generation, Blender for optimization
- **Additional Libraries**:
  - TweenJS (for smooth animations)
  - Howler.js (for audio management)

## Core Systems Design

### Game Loop System

The game loop will manage the update cycle and maintain consistent gameplay regardless of device performance.

```javascript
// Pseudocode for game loop
class GameLoop {
  constructor() {
    this.lastTime = 0;
    this.accumulatedTime = 0;
    this.timeStep = 1000/60; // 60 FPS target
  }
  
  start() {
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }
  
  loop(currentTime) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.accumulatedTime += deltaTime;
    
    // Update game logic in fixed time steps
    while(this.accumulatedTime >= this.timeStep) {
      this.update(this.timeStep);
      this.accumulatedTime -= this.timeStep;
    }
    
    // Render at screen refresh rate
    this.render();
    
    requestAnimationFrame(this.loop.bind(this));
  }
  
  update(deltaTime) {
    // Update game state, physics, AI, etc.
    gameState.update(deltaTime);
    physics.update(deltaTime);
    // etc.
  }
  
  render() {
    // Render the scene
    renderer.render(scene, camera);
  }
}
```

### Input System

The input system will handle keyboard, touch, and gamepad inputs with customizable controls.

```javascript
// Pseudocode for input system
class InputManager {
  constructor() {
    this.keys = {};
    this.bindings = {
      'up': ['ArrowUp', 'KeyW'],
      'down': ['ArrowDown', 'KeyS'],
      'left': ['ArrowLeft', 'KeyA'],
      'right': ['ArrowRight', 'KeyD'],
      'bomb': ['Space', 'KeyB']
    };
    
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    // Add touch/gamepad event listeners as needed
  }
  
  handleKeyDown(event) {
    this.keys[event.code] = true;
  }
  
  handleKeyUp(event) {
    this.keys[event.code] = false;
  }
  
  isActionPressed(action) {
    return this.bindings[action].some(key => this.keys[key]);
  }
}
```

### Grid System

The grid system forms the foundation of the game world, managing the position and state of all game elements.

```javascript
// Pseudocode for grid system
class GridSystem {
  constructor(width, height) {
    this.width = width;  // Typically 15 for Bomberman
    this.height = height; // Typically 13 for Bomberman
    this.cellSize = 1;   // Three.js units
    
    // Grid cell types:
    // 0 = empty (walkable)
    // 1 = solid wall (indestructible)
    // 2 = breakable block
    // 3 = bomb
    // 4 = explosion
    this.grid = Array(height).fill().map(() => Array(width).fill(0));
    
    // Entities positioned on grid (players, enemies, power-ups)
    this.entities = [];
  }
  
  // Convert grid coordinates to 3D world position
  gridToWorld(x, y) {
    return {
      x: x * this.cellSize - (this.width * this.cellSize) / 2,
      y: 0, // y-coordinate in 3D space (height)
      z: y * this.cellSize - (this.height * this.cellSize) / 2
    };
  }
  
  // Convert 3D world position to grid coordinates
  worldToGrid(x, z) {
    return {
      x: Math.floor((x + (this.width * this.cellSize) / 2) / this.cellSize),
      y: Math.floor((z + (this.height * this.cellSize) / 2) / this.cellSize)
    };
  }
  
  isCellWalkable(x, y) {
    // Check if cell is within bounds
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return false;
    }
    
    // Check if cell is empty
    return this.grid[y][x] === 0;
  }
  
  setCellType(x, y, type) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.grid[y][x] = type;
    }
  }
  
  // Add entity to the grid
  addEntity(entity) {
    this.entities.push(entity);
  }
  
  // Remove entity from the grid
  removeEntity(entity) {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
    }
  }
}
```

### Event Management System

To decouple game components, an event system will facilitate communication between systems.

```javascript
// Pseudocode for event manager
class EventManager {
  constructor() {
    this.listeners = {};
  }
  
  subscribe(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    return {
      unsubscribe: () => {
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
      }
    };
  }
  
  publish(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        callback(data);
      });
    }
  }
}

// Usage examples:
// eventManager.subscribe('bomb-placed', handleBombPlaced);
// eventManager.publish('bomb-placed', { x: 5, y: 3 });
```

## Game Mechanics

### Player System

The player system will handle character movement, animation states, and player-specific mechanics.

#### Grid-Based Movement

```javascript
// Pseudocode for player movement
class Player {
  constructor(grid, x, y) {
    this.grid = grid;
    
    // Grid position
    this.gridX = x;
    this.gridY = y;
    
    // World position (for rendering and smooth movement)
    const worldPos = grid.gridToWorld(x, y);
    this.x = worldPos.x;
    this.y = worldPos.y;
    this.z = worldPos.z;
    
    // Movement properties
    this.targetX = this.x;
    this.targetZ = this.z;
    this.moveSpeed = 0.1; // Units per frame
    this.isMoving = false;
    
    // Player stats
    this.bombCount = 1;     // Starting bomb capacity
    this.bombRange = 1;     // Starting explosion range
    this.speed = 1;         // Movement speed multiplier
    this.lives = 3;
    
    // Create 3D model
    this.mesh = createPlayerMesh(); // Function to create Three.js mesh
  }
  
  update(deltaTime) {
    // Handle movement between grid cells with smooth interpolation
    if (this.isMoving) {
      const moveStep = this.moveSpeed * this.speed * deltaTime;
      
      // Calculate direction to target
      const dx = this.targetX - this.x;
      const dz = this.targetZ - this.z;
      
      // Calculate distance to target
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance < moveStep) {
        // We've arrived at the target cell
        this.x = this.targetX;
        this.z = this.targetZ;
        this.isMoving = false;
      } else {
        // Move towards target
        this.x += (dx / distance) * moveStep;
        this.z += (dz / distance) * moveStep;
      }
      
      // Update 3D model position
      this.mesh.position.set(this.x, this.y, this.z);
    }
  }
  
  move(direction) {
    if (this.isMoving) return; // Already moving
    
    let newX = this.gridX;
    let newY = this.gridY;
    
    // Calculate new position based on direction
    switch(direction) {
      case 'up':
        newY -= 1;
        break;
      case 'down':
        newY += 1;
        break;
      case 'left':
        newX -= 1;
        break;
      case 'right':
        newX += 1;
        break;
    }
    
    // Check if the new position is walkable
    if (this.grid.isCellWalkable(newX, newY)) {
      // Update grid coordinates
      this.gridX = newX;
      this.gridY = newY;
      
      // Set target for smooth movement
      const worldPos = this.grid.gridToWorld(newX, newY);
      this.targetX = worldPos.x;
      this.targetZ = worldPos.z;
      this.isMoving = true;
      
      // Update animation state
      this.setAnimationState('walk', direction);
    }
  }
  
  placeBomb() {
    // Check if player can place more bombs
    if (this.bombCount <= 0) return;
    
    // Place bomb at current grid position
    const bomb = new Bomb(this.grid, this.gridX, this.gridY, this.bombRange);
    this.grid.addEntity(bomb);
    
    // Decrease available bombs
    this.bombCount--;
    
    // Listen for bomb explosion to restore bomb count
    bomb.onExplode = () => {
      this.bombCount++;
    };
  }
  
  setAnimationState(state, direction) {
    // Update character animation based on state and direction
    // Implementation depends on 3D model animation system
  }
  
  takeDamage() {
    this.lives--;
    if (this.lives <= 0) {
      this.die();
    } else {
      // Invulnerability period
      // Visual feedback (blinking, etc.)
    }
  }
  
  die() {
    // Death animation
    // Game over logic
  }
  
  collectPowerUp(type) {
    switch(type) {
      case 'bomb':
        this.bombCount++;
        break;
      case 'range':
        this.bombRange++;
        break;
      case 'speed':
        this.speed += 0.2;
        break;
      // Additional power-ups
    }
  }
}
```

### Bomb System

The bomb system will handle bomb placement, timing, and explosion mechanics.

```javascript
// Pseudocode for bomb mechanics
class Bomb {
  constructor(grid, x, y, range) {
    this.grid = grid;
    this.gridX = x;
    this.gridY = y;
    this.range = range;
    
    // Set bomb in grid
    grid.setCellType(x, y, 3); // 3 = bomb
    
    // World position for rendering
    const worldPos = grid.gridToWorld(x, y);
    this.x = worldPos.x;
    this.y = worldPos.y;
    this.z = worldPos.z;
    
    // Bomb timer
    this.timer = 3000; // 3 seconds
    
    // Create 3D model
    this.mesh = createBombMesh(); // Function to create Three.js mesh
    this.mesh.position.set(this.x, this.y, this.z);
    
    // Bomb state
    this.exploded = false;
    
    // Callback for explosion
    this.onExplode = null;
  }
  
  update(deltaTime) {
    if (this.exploded) return;
    
    this.timer -= deltaTime;
    
    // Bomb animation (pulsing effect)
    const scale = 1 + 0.1 * Math.sin(this.timer * 0.01);
    this.mesh.scale.set(scale, scale, scale);
    
    if (this.timer <= 0) {
      this.explode();
    }
  }
  
  explode() {
    if (this.exploded) return;
    
    this.exploded = true;
    this.grid.setCellType(this.gridX, this.gridY, 4); // 4 = explosion
    
    // Create explosion at bomb position
    new Explosion(this.grid, this.gridX, this.gridY, this.range);
    
    // Remove bomb mesh from scene
    this.mesh.parent.remove(this.mesh);
    
    // Notify that bomb has exploded
    if (this.onExplode) {
      this.onExplode();
    }
  }
}

class Explosion {
  constructor(grid, x, y, range) {
    this.grid = grid;
    this.gridX = x;
    this.gridY = y;
    this.range = range;
    
    // Create explosion center
    this.createExplosionPart(x, y, 'center');
    
    // Propagate explosion in four directions
    this.propagateExplosion(x, y, 1, 0, range);  // Right
    this.propagateExplosion(x, y, -1, 0, range); // Left
    this.propagateExplosion(x, y, 0, 1, range);  // Down
    this.propagateExplosion(x, y, 0, -1, range); // Up
    
    // Explosion lifetime
    this.lifetime = 1000; // 1 second
    
    // Explosion mesh parts
    this.parts = [];
  }
  
  propagateExplosion(x, y, dx, dy, remainingRange) {
    if (remainingRange <= 0) return;
    
    // Calculate new position
    const newX = x + dx;
    const newY = y + dy;
    
    // Check if position is within grid bounds
    if (newX < 0 || newX >= this.grid.width || newY < 0 || newY >= this.grid.height) {
      return;
    }
    
    // Get cell type at new position
    const cellType = this.grid.grid[newY][newX];
    
    if (cellType === 1) {
      // Solid wall - stop propagation
      return;
    } else if (cellType === 2) {
      // Breakable block - destroy and stop propagation
      this.grid.setCellType(newX, newY, 0); // 0 = empty
      this.createExplosionPart(newX, newY, 'end');
      
      // Chance to spawn power-up
      if (Math.random() < 0.3) { // 30% chance
        const powerUpType = this.getRandomPowerUpType();
        new PowerUp(this.grid, newX, newY, powerUpType);
      }
    } else {
      // Empty space or bomb - continue propagation
      this.createExplosionPart(newX, newY, 
        remainingRange > 1 ? 'middle' : 'end',
        dx !== 0 ? 'horizontal' : 'vertical'
      );
      
      // Check if there's a bomb to trigger chain reaction
      if (cellType === 3) {
        // Find bomb entity and trigger explosion
        const bomb = this.grid.entities.find(e => 
          e instanceof Bomb && e.gridX === newX && e.gridY === newY
        );
        if (bomb) {
          bomb.timer = 0; // Explode immediately
        }
      }
      
      // Continue propagation
      this.propagateExplosion(newX, newY, dx, dy, remainingRange - 1);
    }
  }
  
  createExplosionPart(x, y, type, orientation) {
    // Set explosion in grid
    this.grid.setCellType(x, y, 4); // 4 = explosion
    
    // World position for rendering
    const worldPos = this.grid.gridToWorld(x, y);
    
    // Create explosion mesh based on type and orientation
    const mesh = createExplosionMesh(type, orientation);
    mesh.position.set(worldPos.x, worldPos.y, worldPos.z);
    
    // Add to scene
    scene.add(mesh);
    
    // Store mesh for later removal
    this.parts.push({
      x: x,
      y: y,
      mesh: mesh
    });
  }
  
  update(deltaTime) {
    this.lifetime -= deltaTime;
    
    if (this.lifetime <= 0) {
      this.remove();
    }
  }
  
  remove() {
    // Remove all explosion parts
    for (const part of this.parts) {
      // Remove explosion from grid
      if (this.grid.grid[part.y][part.x] === 4) { // 4 = explosion
        this.grid.setCellType(part.x, part.y, 0); // 0 = empty
      }
      
      // Remove mesh from scene
      part.mesh.parent.remove(part.mesh);
    }
  }
  
  getRandomPowerUpType() {
    const types = ['bomb', 'range', 'speed'];
    return types[Math.floor(Math.random() * types.length)];
  }
}
```

### Enemy AI System

The enemy AI system will control the behavior of different enemy types.

```javascript
// Pseudocode for enemy AI
class Enemy {
  constructor(grid, x, y, type) {
    this.grid = grid;
    this.gridX = x;
    this.gridY = y;
    
    // World position for rendering
    const worldPos = grid.gridToWorld(x, y);
    this.x = worldPos.x;
    this.y = worldPos.y;
    this.z = worldPos.z;
    
    // Enemy properties
    this.type = type;
    this.moveSpeed = 0.05; // Base speed, varies by enemy type
    
    // Movement
    this.targetX = this.x;
    this.targetZ = this.z;
    this.isMoving = false;
    this.direction = 'right'; // Initial direction
    
    // AI behavior based on type
    switch(type) {
      case 'random':
        this.behavior = new RandomBehavior(this);
        break;
      case 'follower':
        this.behavior = new FollowerBehavior(this);
        break;
      case 'smart':
        this.behavior = new SmartBehavior(this);
        break;
    }
    
    // Create 3D model
    this.mesh = createEnemyMesh(type); // Function to create Three.js mesh
    this.mesh.position.set(this.x, this.y, this.z);
  }
  
  update(deltaTime) {
    // Update AI behavior
    this.behavior.update(deltaTime);
    
    // Handle movement between grid cells
    if (this.isMoving) {
      const moveStep = this.moveSpeed * deltaTime;
      
      // Calculate direction to target
      const dx = this.targetX - this.x;
      const dz = this.targetZ - this.z;
      
      // Calculate distance to target
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance < moveStep) {
        // We've arrived at the target cell
        this.x = this.targetX;
        this.z = this.targetZ;
        this.isMoving = false;
        
        // Let the behavior know we've completed the move
        this.behavior.onMoveComplete();
      } else {
        // Move towards target
        this.x += (dx / distance) * moveStep;
        this.z += (dz / distance) * moveStep;
      }
      
      // Update 3D model position
      this.mesh.position.set(this.x, this.y, this.z);
    }
  }
  
  move(direction) {
    if (this.isMoving) return; // Already moving
    
    let newX = this.gridX;
    let newY = this.gridY;
    
    // Calculate new position based on direction
    switch(direction) {
      case 'up':
        newY -= 1;
        break;
      case 'down':
        newY += 1;
        break;
      case 'left':
        newX -= 1;
        break;
      case 'right':
        newX += 1;
        break;
    }
    
    // Check if the new position is walkable
    if (this.grid.isCellWalkable(newX, newY)) {
      // Update grid coordinates
      this.gridX = newX;
      this.gridY = newY;
      
      // Set target for smooth movement
      const worldPos = this.grid.gridToWorld(newX, newY);
      this.targetX = worldPos.x;
      this.targetZ = worldPos.z;
      this.isMoving = true;
      this.direction = direction;
      
      // Update animation state
      this.setAnimationState('walk', direction);
      
      return true;
    }
    
    return false;
  }
  
  setAnimationState(state, direction) {
    // Update character animation based on state and direction
    // Implementation depends on 3D model animation system
  }
  
  die() {
    // Death animation
    // Remove from game
    this.grid.removeEntity(this);
    this.mesh.parent.remove(this.mesh);
  }
}

// Different AI behaviors
class RandomBehavior {
  constructor(enemy) {
    this.enemy = enemy;
    this.directions = ['up', 'down', 'left', 'right'];
    this.thinkTime = 0;
  }
  
  update(deltaTime) {
    if (this.enemy.isMoving) return;
    
    this.thinkTime -= deltaTime;
    
    if (this.thinkTime <= 0) {
      // Choose a random direction
      const direction = this.directions[Math.floor(Math.random() * this.directions.length)];
      
      // Try to move in that direction
      const success = this.enemy.move(direction);
      
      // Set next think time
      this.thinkTime = success ? 0 : 500; // Think sooner if couldn't move
    }
  }
  
  onMoveComplete() {
    // Set think time after completing a move
    this.thinkTime = 500; // 0.5 seconds
  }
}

class FollowerBehavior {
  constructor(enemy) {
    this.enemy = enemy;
    this.thinkTime = 0;
    this.player = null; // Reference to player, set in game setup
  }
  
  update(deltaTime) {
    if (!this.player || this.enemy.isMoving) return;
    
    this.thinkTime -= deltaTime;
    
    if (this.thinkTime <= 0) {
      // Calculate direction to player
      const dx = this.player.gridX - this.enemy.gridX;
      const dy = this.player.gridY - this.enemy.gridY;
      
      // Try to move horizontally or vertically towards player
      let success = false;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        // Try horizontal movement first
        const direction = dx > 0 ? 'right' : 'left';
        success = this.enemy.move(direction);
        
        if (!success) {
          // Try vertical movement
          const vertDirection = dy > 0 ? 'down' : 'up';
          success = this.enemy.move(vertDirection);
        }
      } else {
        // Try vertical movement first
        const direction = dy > 0 ? 'down' : 'up';
        success = this.enemy.move(direction);
        
        if (!success) {
          // Try horizontal movement
          const horizDirection = dx > 0 ? 'right' : 'left';
          success = this.enemy.move(horizDirection);
        }
      }
      
      // Set next think time
      this.thinkTime = success ? 0 : 500; // Think sooner if couldn't move
    }
  }
  
  onMoveComplete() {
    // Set think time after completing a move
    this.thinkTime = 800; // 0.8 seconds
  }
}

class SmartBehavior {
  constructor(enemy) {
    this.enemy = enemy;
    this.thinkTime = 0;
    this.player = null; // Reference to player, set in game setup
    this.path = [];     // Path to follow
  }
  
  update(deltaTime) {
    if (!this.player || this.enemy.isMoving) return;
    
    this.thinkTime -= deltaTime;
    
    if (this.thinkTime <= 0) {
      // If no path or need to recalculate
      if (this.path.length === 0) {
        this.calculatePath();
      }
      
      // Follow path if available
      if (this.path.length > 0) {
        const nextStep = this.path.shift();
        const dx = nextStep.x - this.enemy.gridX;
        const dy = nextStep.y - this.enemy.gridY;
        
        let direction;
        if (dx > 0) direction = 'right';
        else if (dx < 0) direction = 'left';
        else if (dy > 0) direction = 'down';
        else if (dy < 0) direction = 'up';
        
        const success = this.enemy.move(direction);
        
        if (!success) {
          // Path is blocked, recalculate
          this.path = [];
          this.thinkTime = 300;
        }
      } else {
        // No valid path found, use simpler behavior
        const randomDirection = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)];
        this.enemy.move(randomDirection);
        this.thinkTime = 1000;
      }
    }
  }
  
  calculatePath() {
    // A* pathfinding algorithm implementation
    // This is a simplified version, a real implementation would be more complex
    
    // Path will be array of {x, y} grid positions to follow
    this.path = findPath(
      this.enemy.grid,
      {x: this.enemy.gridX, y: this.enemy.gridY},
      {x: this.player.gridX, y: this.player.gridY}
    );
    
    // If path is too long, only keep first few steps
    if (this.path.length > 5) {
      this.path = this.path.slice(0, 5);
    }
  }
  
  onMoveComplete() {
    // Set think time after completing a move
    this.thinkTime = 200; // 0.2 seconds
  }
}

// Helper function for A* pathfinding
function findPath(grid, start, end) {
  // A* pathfinding implementation
  // Returns array of {x, y} positions to follow
  // Not implemented here for brevity
  return [];
}
```

### Power-Up System

The power-up system will handle the creation and collection of power-ups.

```javascript
// Pseudocode for power-up system
class PowerUp {
  constructor(grid, x, y, type) {
    this.grid = grid;
    this.gridX = x;
    this.gridY = y;
    this.type = type;
    
    // World position for rendering
    const worldPos = grid.gridToWorld(x, y);
    this.x = worldPos.x;
    this.y = worldPos.y;
    this.z = worldPos.z;
    
    // Create 3D model
    this.mesh = createPowerUpMesh(type); // Function to create
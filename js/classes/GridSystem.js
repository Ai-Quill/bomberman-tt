// Function to safely get THREE from window object
function getThree() {
    if (!window.THREE) {
        console.error('THREE is not defined in window object');
        throw new Error('THREE.js is not loaded. Please refresh the page and try again.');
    }
    return window.THREE;
}

class GridSystem {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        
        // Grid cell types:
        // 0 = empty (walkable)
        // 1 = solid wall (indestructible)
        // 2 = breakable block
        // 3 = bomb
        // 4 = explosion
        this.grid = Array(height).fill().map(() => Array(width).fill(0));
        
        // Entities positioned on grid (players, enemies, power-ups)
        this.entities = [];
        
        // Store breakable blocks for reference
        this.breakableBlocks = {};
        
        // Player start position
        this.playerStartX = 1;
        this.playerStartY = 1;
    }
    
    // Convert grid coordinates to 3D world position
    gridToWorld(x, y) {
        return {
            x: x * this.cellSize - (this.width * this.cellSize) / 2,
            y: 0,
            z: y * this.cellSize - (this.height * this.cellSize) / 2
        };
    }
    
    // Convert 3D world position to grid coordinates
    worldToGrid(x, z) {
        return {
            x: Math.floor(x + (this.width * this.cellSize) / 2 / this.cellSize),
            y: Math.floor(z + (this.height * this.cellSize) / 2 / this.cellSize)
        };
    }
    
    isCellWalkable(x, y) {
        // Check if cell is within bounds
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        
        // Check if cell is empty or has an explosion (player can walk through explosions)
        return this.grid[y][x] === 0 || this.grid[y][x] === 4;
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
            
            // If it's a bomb, make sure to clear the cell
            if (entity.constructor.name === 'Bomb') {
                if (this.grid[entity.gridY] && this.grid[entity.gridY][entity.gridX] === 3) {
                    this.setCellType(entity.gridX, entity.gridY, 0);
                    console.log("Grid system cleared bomb cell at", entity.gridX, entity.gridY);
                }
            }
        }
    }

    removeBreakableBlock(x, y) {
        try {
            const THREE = getThree();
            const blockKey = `${x},${y}`;
            const blockMesh = this.breakableBlocks[blockKey];
            if (blockMesh) {
                window.scene.remove(blockMesh);
                if (blockMesh.geometry) blockMesh.geometry.dispose();
                if (blockMesh.material) {
                    if (Array.isArray(blockMesh.material)) {
                        blockMesh.material.forEach(m => m.dispose());
                    } else {
                        blockMesh.material.dispose();
                    }
                }
                delete this.breakableBlocks[blockKey];
                this.setCellType(x, y, 0); // Clear the cell in the grid
                console.log("Removed breakable block at", x, y);
            }
        } catch (error) {
            console.error('Error removing breakable block:', error);
        }
    }

    // Update all entities
    update(deltaTime) {
        try {
            // Create a copy of the entities array to avoid modification during iteration
            const entities = [...this.entities];
            
            // First pass: update all entities
            for (const entity of entities) {
                if (!entity) continue;
                
                if (typeof entity.update === 'function') {
                    if ((entity.constructor && entity.constructor.name === 'Enemy' && entity.isAlive) || 
                        (entity.constructor && entity.constructor.name === 'Player' && entity.lives > 0) ||
                        (entity.constructor && entity.constructor.name === 'Bomb' && !entity.removed) ||
                        (entity.constructor && entity.constructor.name === 'Explosion') ||
                        !(entity.constructor && (entity.constructor.name === 'Enemy' || entity.constructor.name === 'Player' || 
                          entity.constructor.name === 'Bomb' || entity.constructor.name === 'Explosion'))) {
                        entity.update(deltaTime);
                    }
                }
            }
            
            // Second pass: cleanup any bombs that should be removed
            for (let i = this.entities.length - 1; i >= 0; i--) {
                const entity = this.entities[i];
                if (entity && entity.constructor && entity.constructor.name === 'Bomb' && entity.exploded && !entity.removed) {
                    entity.forceRemove();
                }
            }
        } catch (error) {
            console.error('Error updating entities:', error);
        }
    }
}

export default GridSystem; 
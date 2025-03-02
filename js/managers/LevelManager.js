// Function to safely get THREE from window object
function getThree() {
    if (!window.THREE) {
        console.error('THREE is not defined in window object');
        throw new Error('THREE.js is not loaded. Please refresh the page and try again.');
    }
    return window.THREE;
}

// Define game levels
const levels = [
    // Level 1 - Basic level
    {
        width: 15,
        height: 13,
        layout: [
            "###############",
            "#P....*....*..#",
            "#.#.#.#.#.#.#.#",
            "#.............#",
            "#.#.#.#.#.#.#.#",
            "#.............#",
            "#.#.#.#.#.#.#.#",
            "#.............#",
            "#.#.#.#.#.#.#.#",
            "#.............#",
            "#.#.#.#.#.#.#.#",
            "#...*.....*...#",
            "###############"
        ],
        enemyCount: 3,
        theme: 'grass'
    },
    // Level 2 - More enemies and obstacles
    {
        width: 15,
        height: 13,
        layout: [
            "###############",
            "#P...*........#",
            "#.#.#.#.#.#.#.#",
            "#.............#",
            "#.#.#*#.#*#.#.#",
            "#.............#",
            "#.#.#.#.#.#.#.#",
            "#.............#",
            "#.#*#.#.#.#*#.#",
            "#.............#",
            "#.#.#.#.#.#.#.#",
            "#.......*....*#",
            "###############"
        ],
        enemyCount: 5,
        theme: 'sand'
    },
    // Level 3 - Complex layout
    {
        width: 17,
        height: 15,
        layout: [
            "#################",
            "#P.............E#",
            "#.#.#.#.#.#.#.#.#",
            "#..............*#",
            "#.#.#.#.#.#.#.#.#",
            "#*....*....*....#",
            "#.#.#.#.#.#.#.#.#",
            "#..............*#",
            "#.#.#.#.#.#.#.#.#",
            "#*....*....*....#",
            "#.#.#.#.#.#.#.#.#",
            "#..............*#",
            "#.#.#.#.#.#.#.#.#",
            "#E.............E#",
            "#################"
        ],
        enemyCount: 7,
        theme: 'ice'
    }
];

// Parse level layout and create grid
function parseLevelLayout(grid, levelData) {
    try {
        // Get THREE safely
        const THREE = getThree();
        
        const layout = levelData.layout;
        
        // Player start position
        grid.playerStartX = 1;
        grid.playerStartY = 1;
        
        // Create floor
        const floorGeometry = new THREE.PlaneGeometry(grid.width * grid.cellSize, grid.height * grid.cellSize);
        const floorTexture = window.textures[levelData.theme === 'sand' ? 'floorSand' : 
                                           levelData.theme === 'ice' ? 'floorIce' : 
                                           'floor'];
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(grid.width, grid.height);
        
        const floorMaterial = new THREE.MeshStandardMaterial({
            map: floorTexture,
            roughness: 0.8,
            metalness: 0.2,
            side: THREE.DoubleSide
        });
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(0, 0, 0);
        floor.receiveShadow = true;
        window.scene.add(floor);
        
        // Store breakable blocks for reference
        grid.breakableBlocks = {};
        
        // Parse layout
        for (let y = 0; y < layout.length; y++) {
            const row = layout[y];
            for (let x = 0; x < row.length; x++) {
                const cell = row.charAt(x);
                const worldPos = grid.gridToWorld(x, y);
                
                switch (cell) {
                    case '#': // Wall
                        grid.setCellType(x, y, 1);
                        const wallGeometry = new THREE.BoxGeometry(grid.cellSize, grid.cellSize, grid.cellSize);
                        const wallMaterial = new THREE.MeshStandardMaterial({
                            map: window.textures.wall,
                            roughness: 0.7,
                            metalness: 0.3
                        });
                        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                        wall.position.set(worldPos.x, worldPos.y + grid.cellSize * 0.5, worldPos.z);
                        wall.castShadow = true;
                        wall.receiveShadow = true;
                        window.scene.add(wall);
                        break;
                        
                    case '*': // Breakable block
                        grid.setCellType(x, y, 2);
                        const crateGeometry = new THREE.BoxGeometry(grid.cellSize * 0.8, grid.cellSize * 0.8, grid.cellSize * 0.8);
                        const crateMaterial = new THREE.MeshStandardMaterial({
                            map: window.textures.crate,
                            roughness: 0.8,
                            metalness: 0.1
                        });
                        const crate = new THREE.Mesh(crateGeometry, crateMaterial);
                        crate.position.set(worldPos.x, worldPos.y + grid.cellSize * 0.4, worldPos.z);
                        crate.castShadow = true;
                        crate.receiveShadow = true;
                        window.scene.add(crate);
                        
                        // Store reference to breakable block
                        grid.breakableBlocks[`${x},${y}`] = crate;
                        break;
                        
                    case 'P': // Player start
                        grid.playerStartX = x;
                        grid.playerStartY = y;
                        break;
                        
                    case 'E': // Enemy
                        // Enemy will be created in the createLevel function
                        break;
                        
                    default:
                        grid.setCellType(x, y, 0);
                        break;
                }
            }
        }
    } catch (error) {
        console.error('Error parsing level layout:', error);
    }
}

// Create the game level
function createLevel(level) {
    try {
        // Get THREE safely
        const THREE = getThree();
        
        // Get level data
        const levelData = levels[level - 1];
        if (!levelData) {
            console.error('Invalid level:', level);
            return;
        }
        
        // Store existing player if present
        const existingPlayer = window.player;
        
        // Clear existing objects except player
        const objectsToRemove = [];
        window.scene.traverse((object) => {
            if (object instanceof THREE.Mesh && object !== existingPlayer?.mesh) {
                objectsToRemove.push(object);
            }
        });
        
        for (const object of objectsToRemove) {
            window.scene.remove(object);
            if (object.geometry) object.geometry.dispose();
            if (Array.isArray(object.material)) {
                object.material.forEach(m => m.dispose());
            } else if (object.material) {
                object.material.dispose();
            }
        }
        
        // Parse level layout
        parseLevelLayout(window.grid, levelData);
        
        // If player exists, ensure it's still in the grid and scene
        if (existingPlayer) {
            if (!window.scene.children.includes(existingPlayer.mesh)) {
                window.scene.add(existingPlayer.mesh);
            }
            if (!window.grid.entities.includes(existingPlayer)) {
                window.grid.addEntity(existingPlayer);
            }
        }
        
        // Add enemies based on level data
        const Enemy = window.Enemy; // Get Enemy class from window
        
        // Add additional enemies based on enemyCount
        const additionalEnemies = levelData.enemyCount - window.grid.entities.filter(e => e.constructor.name === 'Enemy').length;
        
        if (additionalEnemies > 0) {
            for (let i = 0; i < additionalEnemies; i++) {
                // Find a random empty cell
                let x, y;
                do {
                    x = Math.floor(Math.random() * (window.grid.width - 2)) + 1;
                    y = Math.floor(Math.random() * (window.grid.height - 2)) + 1;
                } while (
                    window.grid.grid[y][x] !== 0 || // Not empty
                    (x === window.grid.playerStartX && y === window.grid.playerStartY) || // Not player start
                    // Not too close to player start
                    (Math.abs(x - window.grid.playerStartX) < 3 && Math.abs(y - window.grid.playerStartY) < 3)
                );
                
                // Create enemy at this position
                new Enemy(window.grid, x, y, window.currentLevel);
            }
        }
        
        // Update UI
        updateLevelDisplay();
        
        // Force a render
        window.renderer.render(window.scene, window.camera);
    } catch (error) {
        console.error('Error creating level:', error);
    }
}

// Update level display in UI
function updateLevelDisplay() {
    const levelElement = document.getElementById('level');
    if (levelElement) {
        levelElement.textContent = `Level: ${window.currentLevel}`;
    }
    
    // Check if player exists before accessing its properties
    if (window.player) {
        const livesElement = document.getElementById('lives');
        const bombsElement = document.getElementById('bombs');
        
        if (livesElement) {
            livesElement.textContent = `Lives: ${window.player.lives}`;
        }
        
        if (bombsElement) {
            bombsElement.textContent = `Bombs: ${window.player.bombCount}`;
        }
    }
}

// Advance to next level
function nextLevel() {
    try {
        window.currentLevel++;
        
        // Remove level complete message
        const message = document.getElementById('levelComplete');
        if (message) {
            document.body.removeChild(message);
        }
        
        // Remove bonus message
        const bonusMessage = document.getElementById('bonusMessage');
        if (bonusMessage) {
            document.body.removeChild(bonusMessage);
        }
        
        // Create new level
        createLevel(window.currentLevel);
        
        // Fade out the overlay
        const overlay = document.getElementById('fadeOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            
            // Remove overlay after fade out
            setTimeout(() => {
                if (overlay && overlay.parentNode) {
                    document.body.removeChild(overlay);
                }
            }, 1000);
        }
        
        // Reset transition state
        window.levelTransition = false;
    } catch (error) {
        console.error('Error advancing to next level:', error);
        // Display error message to user
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Error loading next level. Please refresh the page.';
        document.body.appendChild(errorMessage);
    }
}

export { levels, parseLevelLayout, createLevel, updateLevelDisplay, nextLevel }; 
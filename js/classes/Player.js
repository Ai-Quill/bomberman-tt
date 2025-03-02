import Bomb from './Bomb.js';

// Function to safely get THREE from window object
function getThree() {
    if (!window.THREE) {
        console.error('THREE is not defined in window object');
        throw new Error('THREE.js is not loaded. Please refresh the page and try again.');
    }
    return window.THREE;
}

class Player {
    constructor(grid, x, y) {
        try {
            // Get THREE safely
            const THREE = getThree();
            
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
            this.moveSpeed = 0.008; // Reduced speed for smoother movement
            this.isMoving = false;
            
            // Player stats
            this.bombCount = 1;     // Starting bomb capacity
            this.bombsPlaced = 0;   // Current bombs placed
            this.bombRange = 2;     // Starting explosion range
            this.speed = 1;         // Movement speed multiplier
            this.lives = 3;         // Start with 3 lives
            this.isInvulnerable = false;
            this.bombs = new Set(); // Track active bombs
            
            // Display lives
            this.updateLivesDisplay();
            
            // Store materials for blinking effect
            this.materials = {
                body: new THREE.MeshStandardMaterial({ 
                    map: window.textures.player,
                    roughness: 0.7,
                    metalness: 0.3
                }),
                head: new THREE.MeshStandardMaterial({ 
                    color: 0xffccaa,
                    roughness: 0.5,
                    metalness: 0.1
                })
            };
            
            // Create 3D model
            this.mesh = this.createPlayerMesh(THREE);
            window.scene.add(this.mesh);
        } catch (error) {
            console.error('Error creating player:', error);
            throw error;
        }
    }
    
    updateLivesDisplay() {
        const levelElement = document.getElementById('level');
        const livesElement = document.getElementById('lives');
        const bombsElement = document.getElementById('bombs');
        
        if (levelElement) {
            levelElement.textContent = `Level: ${window.currentLevel}`;
        }
        
        if (livesElement) {
            livesElement.textContent = `Lives: ${this.lives}`;
        }
        
        if (bombsElement) {
            bombsElement.textContent = `Bombs: ${this.bombCount}`;
        }
    }
    
    createPlayerMesh(THREE) {
        if (!THREE || !THREE.BoxGeometry || !THREE.Mesh || !THREE.Group) {
            console.error('Required THREE components are missing:', 
                         'THREE:', !!THREE,
                         'BoxGeometry:', THREE && !!THREE.BoxGeometry,
                         'Mesh:', THREE && !!THREE.Mesh,
                         'Group:', THREE && !!THREE.Group);
            throw new Error('THREE.js components required for Player mesh are not available');
        }
        
        // Create player body
        const bodyGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const body = new THREE.Mesh(bodyGeometry, this.materials.body);
        
        // Create player head
        const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const head = new THREE.Mesh(headGeometry, this.materials.head);
        head.position.y = 0.6; // Position head above body
        
        // Create player group
        const playerGroup = new THREE.Group();
        playerGroup.add(body);
        playerGroup.add(head);
        
        // Set initial position
        playerGroup.position.y = 0.4; // Lift player slightly off ground
        
        // Enable shadows
        body.castShadow = true;
        head.castShadow = true;
        
        return playerGroup;
    }
    
    update(deltaTime) {
        // Handle input if not moving
        if (!this.isMoving) {
            if (window.inputManager.isActionPressed('up')) {
                this.move('up');
            } else if (window.inputManager.isActionPressed('down')) {
                this.move('down');
            } else if (window.inputManager.isActionPressed('left')) {
                this.move('left');
            } else if (window.inputManager.isActionPressed('right')) {
                this.move('right');
            }
            
            if (window.inputManager.isActionPressed('bomb')) {
                this.placeBomb();
            }
        }
        
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

        // Check for collision with enemies
        if (!this.isInvulnerable) {
            for (const entity of this.grid.entities) {
                if (entity.constructor.name === 'Enemy' && entity.isAlive) {
                    // Check if player and enemy are in the same grid cell
                    if (entity.gridX === this.gridX && entity.gridY === this.gridY) {
                        this.takeDamage();
                        break;
                    }
                    
                    // Also check for close proximity in world space for smoother collision detection
                    const dx = this.x - entity.x;
                    const dz = this.z - entity.z;
                    const distance = Math.sqrt(dx * dx + dz * dz);
                    
                    if (distance < 0.5) { // If within half a cell size
                        this.takeDamage();
                        break;
                    }
                }
            }
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
            
            // Play movement sound
            if (window.soundManager) {
                window.soundManager.play('playerMove');
            }
            
            // Rotate player model based on direction
            switch(direction) {
                case 'up':
                    this.mesh.rotation.y = Math.PI;
                    break;
                case 'down':
                    this.mesh.rotation.y = 0;
                    break;
                case 'left':
                    this.mesh.rotation.y = Math.PI / 2;
                    break;
                case 'right':
                    this.mesh.rotation.y = -Math.PI / 2;
                    break;
            }
        }
    }
    
    placeBomb() {
        // Check if player can place more bombs
        if (this.bombs.size >= this.bombCount) {
            console.log("Cannot place more bombs, current count:", this.bombs.size, "max:", this.bombCount);
            return;
        }
        
        // Check if there's already a bomb at this position
        if (this.grid.grid[this.gridY][this.gridX] === 3) {
            console.log("Bomb already exists at this position");
            return;
        }
        
        console.log("Placing bomb, current bombs:", this.bombs.size);
        
        // Place bomb at current grid position
        const bomb = new Bomb(this.grid, this.gridX, this.gridY, this.bombRange);
        this.bombs.add(bomb);
        
        // Listen for bomb explosion to restore bomb count
        bomb.onExplode = () => {
            if (this.bombs.has(bomb)) {
                this.bombs.delete(bomb);
                console.log("Bomb exploded and removed from tracking, bombs remaining:", this.bombs.size);
            }
        };
    }
    
    takeDamage() {
        if (this.isInvulnerable) return;
        
        this.lives--;
        this.updateLivesDisplay();
        
        if (this.lives <= 0) {
            this.die();
        } else {
            // Create death effect particles
            this.createDeathEffect();
            
            // Reset position to start
            this.gridX = this.grid.playerStartX;
            this.gridY = this.grid.playerStartY;
            const worldPos = this.grid.gridToWorld(this.gridX, this.gridY);
            this.x = worldPos.x;
            this.z = worldPos.z;
            this.targetX = worldPos.x;
            this.targetZ = worldPos.z;
            this.mesh.position.set(worldPos.x, this.y, worldPos.z);
            
            // Invulnerability period
            this.isInvulnerable = true;
            
            // Make materials transparent
            this.materials.body.transparent = true;
            this.materials.head.transparent = true;
            
            // Blink effect
            let blinkCount = 0;
            const blinkInterval = setInterval(() => {
                blinkCount++;
                this.materials.body.opacity = this.materials.body.opacity === 1 ? 0.3 : 1;
                this.materials.head.opacity = this.materials.head.opacity === 1 ? 0.3 : 1;
                
                if (blinkCount >= 20) { // 10 full blinks
                    clearInterval(blinkInterval);
                    this.isInvulnerable = false;
                    this.materials.body.transparent = false;
                    this.materials.head.transparent = false;
                    this.materials.body.opacity = 1;
                    this.materials.head.opacity = 1;
                }
            }, 100);
            
            // Play hit sound
            if (window.soundManager) {
                window.soundManager.play('playerHit');
            }
        }
    }
    
    createDeathEffect() {
        // Create particle effect for hit
        const particleCount = 15;
        const particles = new THREE.Group();
        
        for (let i = 0; i < particleCount; i++) {
            // Create small particle
            const size = 0.05 + Math.random() * 0.05;
            const geometry = new THREE.SphereGeometry(size, 8, 8);
            
            // Red particles for hit effect
            const material = new THREE.MeshStandardMaterial({
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(geometry, material);
            
            // Random position within player
            particle.position.set(
                (Math.random() - 0.5) * 0.5,
                Math.random() * 0.7,
                (Math.random() - 0.5) * 0.5
            );
            
            // Random velocity
            particle.userData.velocity = {
                x: (Math.random() - 0.5) * 0.03,
                y: 0.01 + Math.random() * 0.02,
                z: (Math.random() - 0.5) * 0.03
            };
            
            // Add to particle group
            particles.add(particle);
        }
        
        // Position particle group at player position
        particles.position.set(this.x, this.y, this.z);
        window.scene.add(particles);
        
        // Add particle system to grid entities for updating
        const particleSystem = {
            mesh: particles,
            lifetime: 800, // 0.8 seconds
            update: function(deltaTime) {
                this.lifetime -= deltaTime;
                
                if (this.lifetime <= 0) {
                    // Remove particles when done
                    window.scene.remove(particles);
                    window.grid.removeEntity(this);
                    
                    // Dispose of geometries and materials
                    particles.children.forEach(particle => {
                        if (particle.geometry) particle.geometry.dispose();
                        if (particle.material) particle.material.dispose();
                    });
                    
                    return;
                }
                
                // Update each particle
                particles.children.forEach(particle => {
                    // Move particle based on velocity
                    particle.position.x += particle.userData.velocity.x;
                    particle.position.y += particle.userData.velocity.y;
                    particle.position.z += particle.userData.velocity.z;
                    
                    // Apply gravity
                    particle.userData.velocity.y -= 0.0005;
                    
                    // Fade out
                    if (particle.material) {
                        particle.material.opacity = this.lifetime / 800;
                    }
                });
            }
        };
        
        this.grid.addEntity(particleSystem);
    }
    
    die() {
        // Create death explosion effect
        this.createDeathEffect();
        
        // Play death sound
        if (window.soundManager) {
            window.soundManager.play('playerDeath');
        }
        
        // Show game over message
        window.showError('Game Over! Click OK to restart.');
        
        // Stop the game loop
        if (window.gameLoop) {
            window.gameLoop.stop();
        }
        
        // Reset game state
        window.currentLevel = 1;
        
        // Reset player stats
        this.lives = 3;
        this.bombCount = 1;
        this.bombRange = 2;
        this.speed = 1;
        this.isInvulnerable = false;
        
        // Remove old mesh
        if (this.mesh) {
            window.scene.remove(this.mesh);
        }
        
        // Create fresh materials
        this.materials = {
            body: new THREE.MeshStandardMaterial({ 
                map: window.textures.player,
                roughness: 0.7,
                metalness: 0.3
            }),
            head: new THREE.MeshStandardMaterial({ 
                color: 0xffccaa,
                roughness: 0.5,
                metalness: 0.1
            })
        };
        
        // Create new player mesh
        const bodyGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const body = new THREE.Mesh(bodyGeometry, this.materials.body);
        
        const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const head = new THREE.Mesh(headGeometry, this.materials.head);
        head.position.y = 0.6;
        
        const playerGroup = new THREE.Group();
        playerGroup.add(body);
        playerGroup.add(head);
        playerGroup.position.y = 0.4;
        
        body.castShadow = true;
        head.castShadow = true;
        
        this.mesh = playerGroup;
        
        // Position player at start
        const worldPos = window.grid.gridToWorld(1, 1);
        this.gridX = 1;
        this.gridY = 1;
        this.x = worldPos.x;
        this.z = worldPos.z;
        this.targetX = worldPos.x;
        this.targetZ = worldPos.z;
        this.mesh.position.set(worldPos.x, 0.4, worldPos.z);
        
        // Add to scene immediately
        window.scene.add(this.mesh);
        
        // Ensure player is in grid
        if (!window.grid.entities.includes(this)) {
            window.grid.addEntity(this);
        }
        
        // Force immediate render
        window.renderer.render(window.scene, window.camera);
        
        // Recreate level after a short delay
        setTimeout(() => {
            // Create new level
            window.createLevel(1);
            
            // Update display
            this.updateLivesDisplay();
            
            // Force another render
            window.renderer.render(window.scene, window.camera);
            
            console.log('Player respawned at:', this.mesh.position);
        }, 1000);
    }
}

export default Player; 
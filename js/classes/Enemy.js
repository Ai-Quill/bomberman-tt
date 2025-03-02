// Function to safely get THREE from window object
function getThree() {
    if (!window.THREE) {
        console.error('THREE is not defined in window object');
        throw new Error('THREE.js is not loaded. Please refresh the page and try again.');
    }
    return window.THREE;
}

class Enemy {
    constructor(grid, x, y, level) {
        try {
            // Get THREE safely
            const THREE = getThree();
            
            this.grid = grid;
            this.gridX = x;
            this.gridY = y;
            this.level = level;
            this.isAlive = true;
            
            // World position
            const worldPos = grid.gridToWorld(x, y);
            this.x = worldPos.x;
            this.y = worldPos.y;
            this.z = worldPos.z;
            
            // Movement properties
            this.targetX = this.x;
            this.targetZ = this.z;
            this.moveSpeed = 0.004 + (level * 0.001); // Speed increases with level
            this.isMoving = false;
            this.direction = 'right';
            this.thinkTime = 0;
            
            // Create enemy mesh
            this.mesh = this.createEnemyMesh(THREE);
            window.scene.add(this.mesh);
            
            // Add to grid entities
            grid.addEntity(this);
        } catch (error) {
            console.error('Error creating enemy:', error);
            throw error;
        }
    }
    
    createEnemyMesh(THREE) {
        if (!THREE || !THREE.BoxGeometry || !THREE.Mesh || !THREE.Group) {
            console.error('Required THREE components are missing:', 
                         'THREE:', !!THREE,
                         'BoxGeometry:', THREE && !!THREE.BoxGeometry,
                         'Mesh:', THREE && !!THREE.Mesh,
                         'Group:', THREE && !!THREE.Group);
            throw new Error('THREE.js components required for Enemy mesh are not available');
        }
        
        // Create enemy body
        const bodyGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            map: this.level === 1 ? window.textures.enemyRed :
                 this.level === 2 ? window.textures.enemyBlue :
                 window.textures.enemyGreen,
            roughness: 0.7,
            metalness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        
        // Create enemy group
        const enemyGroup = new THREE.Group();
        enemyGroup.add(body);
        
        // Set initial position
        enemyGroup.position.set(this.x, 0.4, this.z);
        
        // Enable shadows
        body.castShadow = true;
        
        return enemyGroup;
    }
    
    update(deltaTime) {
        if (!this.isAlive) return;
        
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
                this.thinkTime = 500; // Wait before next move
            } else {
                // Move towards target
                this.x += (dx / distance) * moveStep;
                this.z += (dz / distance) * moveStep;
                
                // Update mesh position
                this.mesh.position.set(this.x, 0.4, this.z);
            }
        } else {
            // Think about next move
            this.thinkTime -= deltaTime;
            
            if (this.thinkTime <= 0) {
                this.decideNextMove();
            }
        }
    }
    
    decideNextMove() {
        if (!this.isAlive || this.isMoving) return;
        
        // Available directions
        const directions = ['up', 'down', 'left', 'right'];
        
        // Try to move towards player if on same row/column
        const player = this.grid.entities.find(e => e.constructor.name === 'Player');
        if (player) {
            if (this.gridX === player.gridX) {
                if (this.gridY > player.gridY && this.canMove('up')) {
                    this.move('up');
                    return;
                } else if (this.gridY < player.gridY && this.canMove('down')) {
                    this.move('down');
                    return;
                }
            }
            if (this.gridY === player.gridY) {
                if (this.gridX > player.gridX && this.canMove('left')) {
                    this.move('left');
                    return;
                } else if (this.gridX < player.gridX && this.canMove('right')) {
                    this.move('right');
                    return;
                }
            }
        }
        
        // If can't move towards player, choose random valid direction
        const validDirections = directions.filter(dir => this.canMove(dir));
        if (validDirections.length > 0) {
            const randomDir = validDirections[Math.floor(Math.random() * validDirections.length)];
            this.move(randomDir);
        }
    }
    
    canMove(direction) {
        let newX = this.gridX;
        let newY = this.gridY;
        
        switch(direction) {
            case 'up': newY--; break;
            case 'down': newY++; break;
            case 'left': newX--; break;
            case 'right': newX++; break;
        }
        
        return this.grid.isCellWalkable(newX, newY);
    }
    
    move(direction) {
        if (this.isMoving || !this.isAlive) return;
        
        let newX = this.gridX;
        let newY = this.gridY;
        
        switch(direction) {
            case 'up': newY--; break;
            case 'down': newY++; break;
            case 'left': newX--; break;
            case 'right': newX++; break;
        }
        
        if (this.grid.isCellWalkable(newX, newY)) {
            // Update grid coordinates
            this.gridX = newX;
            this.gridY = newY;
            
            // Set target for smooth movement
            const worldPos = this.grid.gridToWorld(newX, newY);
            this.targetX = worldPos.x;
            this.targetZ = worldPos.z;
            this.isMoving = true;
            
            // Rotate enemy based on direction
            switch(direction) {
                case 'up': this.mesh.rotation.y = Math.PI; break;
                case 'down': this.mesh.rotation.y = 0; break;
                case 'left': this.mesh.rotation.y = Math.PI / 2; break;
                case 'right': this.mesh.rotation.y = -Math.PI / 2; break;
            }
        }
    }
    
    die() {
        if (!this.isAlive) return;
        
        this.isAlive = false;
        
        // Create death effect
        const particleCount = 10;
        const particles = new THREE.Group();
        
        for (let i = 0; i < particleCount; i++) {
            const size = 0.1 + Math.random() * 0.1;
            const geometry = new THREE.SphereGeometry(size, 8, 8);
            const material = new THREE.MeshStandardMaterial({
                color: this.level === 1 ? 0xff0000 :
                       this.level === 2 ? 0x0000ff :
                       0x00ff00,
                emissive: this.level === 1 ? 0xff0000 :
                         this.level === 2 ? 0x0000ff :
                         0x00ff00,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(geometry, material);
            particle.position.set(
                (Math.random() - 0.5) * 0.5,
                Math.random() * 0.7,
                (Math.random() - 0.5) * 0.5
            );
            
            particle.userData.velocity = {
                x: (Math.random() - 0.5) * 0.05,
                y: 0.05 + Math.random() * 0.05,
                z: (Math.random() - 0.5) * 0.05
            };
            
            particles.add(particle);
        }
        
        particles.position.set(this.x, this.y, this.z);
        window.scene.add(particles);
        
        // Add particle system to grid entities
        const particleSystem = {
            mesh: particles,
            lifetime: 1000,
            update: function(deltaTime) {
                this.lifetime -= deltaTime;
                
                if (this.lifetime <= 0) {
                    window.scene.remove(particles);
                    window.grid.removeEntity(this);
                    
                    particles.children.forEach(particle => {
                        if (particle.geometry) particle.geometry.dispose();
                        if (particle.material) particle.material.dispose();
                    });
                    
                    return;
                }
                
                particles.children.forEach(particle => {
                    particle.position.x += particle.userData.velocity.x;
                    particle.position.y += particle.userData.velocity.y;
                    particle.position.z += particle.userData.velocity.z;
                    
                    particle.userData.velocity.y -= 0.001;
                    
                    if (particle.material) {
                        particle.material.opacity = this.lifetime / 1000;
                    }
                });
            }
        };
        
        this.grid.addEntity(particleSystem);
        
        // Remove enemy mesh
        window.scene.remove(this.mesh);
        
        // Play death sound
        if (window.soundManager) {
            window.soundManager.play('enemyDeath');
        }
        
        // Check if all enemies are dead
        const remainingEnemies = this.grid.entities.filter(e => 
            e.constructor.name === 'Enemy' && e.isAlive
        );
        
        if (remainingEnemies.length === 0) {
            // Level complete!
            if (window.currentLevel < window.levels.length) {
                // Show level complete message
                const message = document.createElement('div');
                message.id = 'levelComplete';
                message.style.position = 'absolute';
                message.style.top = '50%';
                message.style.left = '50%';
                message.style.transform = 'translate(-50%, -50%)';
                message.style.color = 'white';
                message.style.fontSize = '48px';
                message.style.textAlign = 'center';
                message.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
                message.innerHTML = 'Level Complete!<br>Get Ready...';
                document.body.appendChild(message);
                
                // Create fade overlay
                const overlay = document.createElement('div');
                overlay.id = 'fadeOverlay';
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 1s';
                document.body.appendChild(overlay);
                
                // Play level complete sound
                if (window.soundManager) {
                    window.soundManager.play('levelComplete');
                }
                
                // Start level transition
                setTimeout(() => {
                    overlay.style.opacity = '1';
                    setTimeout(window.nextLevel, 1000);
                }, 2000);
            } else {
                // Game complete!
                window.showError('Congratulations! You completed all levels!');
            }
        }
    }
}

export default Enemy; 
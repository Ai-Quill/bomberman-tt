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
    constructor(grid, x, y, characterType = 'default') {
        try {
            // Get THREE safely
            const THREE = getThree();
            
            this.grid = grid;
            this.characterType = characterType;
            
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
            this.bombType = characterType === 'alt' ? 'alt' : 'default'; // Bomb type based on character
            
            // Display lives
            this.updateLivesDisplay();
            
            // Select texture based on character type
            let playerTexture, bodyColor;
            
            switch (characterType) {
                case 'alt':
                    playerTexture = window.textures.playerAlt;
                    bodyColor = 0xffccaa;
                    break;
                case 'girl':
                    playerTexture = window.textures.playerGirl;
                    bodyColor = 0xffddbb;
                    break;
                default:
                    playerTexture = window.textures.player;
                    bodyColor = 0xffccaa;
                    break;
            }
            
            // Store materials for blinking effect
            this.materials = {
                body: new THREE.MeshStandardMaterial({ 
                    map: playerTexture,
                    roughness: 0.7,
                    metalness: 0.3,
                    transparent: true,
                    alphaTest: 0.5,
                    side: THREE.DoubleSide
                }),
                head: new THREE.MeshStandardMaterial({ 
                    color: bodyColor,
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
        const livesDisplay = document.getElementById('lives-display');
        if (livesDisplay) {
            livesDisplay.textContent = `Lives: ${this.lives} | Bombs: ${this.bombCount} | Range: ${this.bombRange} | Speed: ${this.speed.toFixed(1)}`;
            
            // Add bomb type indicator
            const bombTypeIndicator = document.getElementById('bomb-type-indicator') || document.createElement('div');
            bombTypeIndicator.id = 'bomb-type-indicator';
            bombTypeIndicator.textContent = `Bomb Type: ${this.bombType === 'alt' ? 'Digital' : 'Classic'}`;
            bombTypeIndicator.style.marginTop = '5px';
            
            if (!document.getElementById('bomb-type-indicator')) {
                livesDisplay.parentNode.appendChild(bombTypeIndicator);
            }
        }
    }
    
    createPlayerMesh(THREE) {
        if (!THREE || !THREE.SphereGeometry || !THREE.BoxGeometry || !THREE.CylinderGeometry || !THREE.Mesh || !THREE.Group) {
            console.error('Required THREE components are missing:', 
                         'THREE:', !!THREE,
                         'SphereGeometry:', THREE && !!THREE.SphereGeometry,
                         'BoxGeometry:', THREE && !!THREE.BoxGeometry,
                         'CylinderGeometry:', THREE && !!THREE.CylinderGeometry,
                         'Mesh:', THREE && !!THREE.Mesh,
                         'Group:', THREE && !!THREE.Group);
            throw new Error('THREE.js components required for Player mesh are not available');
        }
        
        // Create player group
        const playerGroup = new THREE.Group();
        
        try {
            // Define colors based on character type
            let primaryColor, secondaryColor, accentColor, helmetColor, visorColor;
            
            switch (this.characterType) {
                case 'alt':
                    primaryColor = 0xff5533;    // Orange-red suit
                    secondaryColor = 0xdddddd;  // White details
                    accentColor = 0xffcc44;     // Gold accents
                    helmetColor = 0xffffff;     // White helmet
                    visorColor = 0x3399ff;      // Blue visor
                    break;
                case 'girl':
                    primaryColor = 0xff66aa;    // Pink suit
                    secondaryColor = 0xffffff;  // White details
                    accentColor = 0xffdd44;     // Gold accents
                    helmetColor = 0xffffff;     // White helmet
                    visorColor = 0x99ccff;      // Light blue visor
                    break;
                default:
                    primaryColor = 0x3366cc;    // Blue suit (like in the image)
                    secondaryColor = 0xffffff;  // White details
                    accentColor = 0xff9933;     // Orange accents
                    helmetColor = 0xffffff;     // White helmet
                    visorColor = 0x66ccff;      // Light blue visor
                    break;
            }
            
            // Create materials
            const suitMaterial = new THREE.MeshStandardMaterial({
                color: primaryColor,
                roughness: 0.6,
                metalness: 0.2
            });
            
            const helmetMaterial = new THREE.MeshStandardMaterial({
                color: helmetColor,
                roughness: 0.4,
                metalness: 0.3
            });
            
            const visorMaterial = new THREE.MeshStandardMaterial({
                color: visorColor,
                roughness: 0.2,
                metalness: 0.8,
                transparent: true,
                opacity: 0.9
            });
            
            const detailMaterial = new THREE.MeshStandardMaterial({
                color: secondaryColor,
                roughness: 0.5,
                metalness: 0.3
            });
            
            const accentMaterial = new THREE.MeshStandardMaterial({
                color: accentColor,
                roughness: 0.3,
                metalness: 0.8,
                emissive: accentColor,
                emissiveIntensity: 0.2
            });
            
            const skinMaterial = new THREE.MeshStandardMaterial({
                color: 0xffccaa,
                roughness: 0.8,
                metalness: 0.1
            });
            
            // Store materials for blinking effect
            this.materials = {
                suit: suitMaterial,
                helmet: helmetMaterial,
                visor: visorMaterial,
                detail: detailMaterial,
                accent: accentMaterial,
                skin: skinMaterial
            };
            
            // Create body parts
            
            // Head (helmet)
            const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
            const head = new THREE.Mesh(headGeometry, helmetMaterial);
            head.position.y = 0.85;
            
            // Visor (front of helmet)
            const visorGeometry = new THREE.SphereGeometry(0.2, 16, 16, Math.PI * 0.25, Math.PI * 0.5, Math.PI * 0.25, Math.PI * 0.5);
            const visor = new THREE.Mesh(visorGeometry, visorMaterial);
            visor.position.set(0, 0.85, 0.1);
            
            // Face (inside visor)
            const faceGeometry = new THREE.SphereGeometry(0.18, 12, 12, Math.PI * 0.25, Math.PI * 0.5, Math.PI * 0.25, Math.PI * 0.5);
            const face = new THREE.Mesh(faceGeometry, skinMaterial);
            face.position.set(0, 0.85, 0.11);
            
            // Eyes
            const eyeGeometry = new THREE.SphereGeometry(0.04, 8, 8);
            const leftEye = new THREE.Mesh(eyeGeometry, new THREE.MeshStandardMaterial({ color: 0x000000 }));
            leftEye.position.set(-0.07, 0.87, 0.2);
            const rightEye = new THREE.Mesh(eyeGeometry, new THREE.MeshStandardMaterial({ color: 0x000000 }));
            rightEye.position.set(0.07, 0.87, 0.2);
            
            // Cheeks
            const cheekGeometry = new THREE.SphereGeometry(0.04, 8, 8);
            const leftCheek = new THREE.Mesh(cheekGeometry, new THREE.MeshStandardMaterial({ color: 0xff9999 }));
            leftCheek.position.set(-0.1, 0.8, 0.18);
            leftCheek.scale.set(1, 0.6, 0.6);
            const rightCheek = new THREE.Mesh(cheekGeometry, new THREE.MeshStandardMaterial({ color: 0xff9999 }));
            rightCheek.position.set(0.1, 0.8, 0.18);
            rightCheek.scale.set(1, 0.6, 0.6);
            
            // Mouth
            const mouthGeometry = new THREE.BoxGeometry(0.08, 0.02, 0.01);
            const mouth = new THREE.Mesh(mouthGeometry, new THREE.MeshStandardMaterial({ color: 0x000000 }));
            mouth.position.set(0, 0.78, 0.22);
            
            // Torso
            const torsoGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.25);
            torsoGeometry.translate(0, 0.6, 0);
            const torso = new THREE.Mesh(torsoGeometry, suitMaterial);
            
            // Chest plate
            const chestGeometry = new THREE.BoxGeometry(0.3, 0.25, 0.05);
            const chest = new THREE.Mesh(chestGeometry, detailMaterial);
            chest.position.set(0, 0.65, 0.15);
            
            // Belt
            const beltGeometry = new THREE.BoxGeometry(0.42, 0.06, 0.27);
            const belt = new THREE.Mesh(beltGeometry, new THREE.MeshStandardMaterial({ color: 0x663311 }));
            belt.position.set(0, 0.42, 0);
            
            // Belt buckle
            const buckleGeometry = new THREE.SphereGeometry(0.06, 8, 8);
            const buckle = new THREE.Mesh(buckleGeometry, accentMaterial);
            buckle.position.set(0, 0.42, 0.15);
            
            // Headphones
            const headphoneGeometry = new THREE.TorusGeometry(0.25, 0.05, 8, 16, Math.PI);
            const headphones = new THREE.Mesh(headphoneGeometry, new THREE.MeshStandardMaterial({ color: 0x333333 }));
            headphones.position.set(0, 0.85, 0);
            headphones.rotation.x = Math.PI / 2;
            
            // Headphone ear pieces
            const earGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 8);
            const leftEar = new THREE.Mesh(earGeometry, accentMaterial);
            leftEar.position.set(-0.25, 0.85, 0);
            leftEar.rotation.z = Math.PI / 2;
            const rightEar = new THREE.Mesh(earGeometry, accentMaterial);
            rightEar.position.set(0.25, 0.85, 0);
            rightEar.rotation.z = Math.PI / 2;
            
            // Arms
            const armGeometry = new THREE.BoxGeometry(0.15, 0.3, 0.15);
            const leftArm = new THREE.Mesh(armGeometry, suitMaterial);
            leftArm.position.set(-0.275, 0.6, 0);
            const rightArm = new THREE.Mesh(armGeometry, suitMaterial);
            rightArm.position.set(0.275, 0.6, 0);
            
            // Hands (gloves)
            const handGeometry = new THREE.SphereGeometry(0.08, 8, 8);
            const leftHand = new THREE.Mesh(handGeometry, detailMaterial);
            leftHand.position.set(-0.275, 0.4, 0);
            const rightHand = new THREE.Mesh(handGeometry, detailMaterial);
            rightHand.position.set(0.275, 0.4, 0);
            
            // Legs
            const legGeometry = new THREE.BoxGeometry(0.15, 0.3, 0.15);
            const leftLeg = new THREE.Mesh(legGeometry, suitMaterial);
            leftLeg.position.set(-0.12, 0.2, 0);
            const rightLeg = new THREE.Mesh(legGeometry, suitMaterial);
            rightLeg.position.set(0.12, 0.2, 0);
            
            // Feet (boots)
            const footGeometry = new THREE.BoxGeometry(0.18, 0.1, 0.2);
            const leftFoot = new THREE.Mesh(footGeometry, detailMaterial);
            leftFoot.position.set(-0.12, 0.05, 0.02);
            const rightFoot = new THREE.Mesh(footGeometry, detailMaterial);
            rightFoot.position.set(0.12, 0.05, 0.02);
            
            // Add all parts to the group
            playerGroup.add(head);
            playerGroup.add(visor);
            playerGroup.add(face);
            playerGroup.add(leftEye);
            playerGroup.add(rightEye);
            playerGroup.add(leftCheek);
            playerGroup.add(rightCheek);
            playerGroup.add(mouth);
            playerGroup.add(torso);
            playerGroup.add(chest);
            playerGroup.add(belt);
            playerGroup.add(buckle);
            playerGroup.add(headphones);
            playerGroup.add(leftEar);
            playerGroup.add(rightEar);
            playerGroup.add(leftArm);
            playerGroup.add(rightArm);
            playerGroup.add(leftHand);
            playerGroup.add(rightHand);
            playerGroup.add(leftLeg);
            playerGroup.add(rightLeg);
            playerGroup.add(leftFoot);
            playerGroup.add(rightFoot);
            
            // Add character-specific details
            if (this.characterType === 'girl') {
                // Add ponytail for girl character
                const ponytailGeometry = new THREE.CylinderGeometry(0.08, 0.05, 0.3, 8);
                const ponytail = new THREE.Mesh(ponytailGeometry, new THREE.MeshStandardMaterial({ color: 0xffaa22 }));
                ponytail.position.set(0, 0.85, -0.25);
                ponytail.rotation.x = Math.PI / 2;
                playerGroup.add(ponytail);
            } else if (this.characterType === 'alt') {
                // Add a hat for alt character
                const hatGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.1, 8);
                const hat = new THREE.Mesh(hatGeometry, accentMaterial);
                hat.position.set(0, 1.05, 0);
                playerGroup.add(hat);
            }
            
            // Enable shadows for all parts
            playerGroup.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.castShadow = true;
                    object.receiveShadow = true;
                }
            });
            
            // Add animations
            this.animationTime = 0;
            this.walkCycle = 0;
            
        } catch (error) {
            console.error('Error creating player mesh parts:', error);
            // Fallback to simple box if complex geometry fails
            const fallbackGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
            const fallback = new THREE.Mesh(fallbackGeometry, this.materials.suit);
            fallback.castShadow = true;
            playerGroup.add(fallback);
        }
        
        // Set initial position
        playerGroup.position.y = 0.2; // Lift player slightly off ground
        
        return playerGroup;
    }
    
    update(deltaTime) {
        // Update animation time
        this.animationTime += deltaTime;
        
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
                
                // Reset walk cycle
                this.walkCycle = 0;
            } else {
                // Move towards target
                this.x += (dx / distance) * moveStep;
                this.z += (dz / distance) * moveStep;
                
                // Update walk cycle for animation
                this.walkCycle += deltaTime * 0.01;
                
                // Apply walking animation
                if (this.mesh && this.mesh.children) {
                    // Find leg parts
                    const leftLeg = this.mesh.children.find(child => 
                        child.position.x < 0 && child.position.y < 0.3 && child.position.y > 0.1);
                    const rightLeg = this.mesh.children.find(child => 
                        child.position.x > 0 && child.position.y < 0.3 && child.position.y > 0.1);
                    
                    if (leftLeg && rightLeg) {
                        // Animate legs in opposite phases
                        leftLeg.position.y = 0.2 + Math.sin(this.walkCycle * Math.PI * 2) * 0.05;
                        rightLeg.position.y = 0.2 - Math.sin(this.walkCycle * Math.PI * 2) * 0.05;
                        
                        // Also move feet
                        const leftFoot = this.mesh.children.find(child => 
                            child.position.x < 0 && child.position.y < 0.1);
                        const rightFoot = this.mesh.children.find(child => 
                            child.position.x > 0 && child.position.y < 0.1);
                        
                        if (leftFoot && rightFoot) {
                            leftFoot.position.y = 0.05 + Math.sin(this.walkCycle * Math.PI * 2) * 0.05;
                            rightFoot.position.y = 0.05 - Math.sin(this.walkCycle * Math.PI * 2) * 0.05;
                        }
                    }
                    
                    // Slightly bob the body up and down
                    this.mesh.position.y = 0.2 + Math.abs(Math.sin(this.walkCycle * Math.PI)) * 0.03;
                    
                    // Rotate the player to face the direction of movement
                    if (Math.abs(dx) > Math.abs(dz)) {
                        // Moving more horizontally
                        this.mesh.rotation.y = dx > 0 ? Math.PI * 1.5 : Math.PI * 0.5;
                    } else {
                        // Moving more vertically
                        this.mesh.rotation.y = dz > 0 ? Math.PI : 0;
                    }
                }
            }
            
            // Update 3D model position
            this.mesh.position.x = this.x;
            this.mesh.position.z = this.z;
        } else {
            // Idle animation
            const breathingSpeed = 0.001;
            const breathingAmount = 0.02;
            
            if (this.mesh) {
                // Subtle breathing animation
                this.mesh.position.y = 0.2 + Math.sin(this.animationTime * breathingSpeed) * breathingAmount;
                
                // Slightly move arms
                const leftArm = this.mesh.children.find(child => 
                    child.position.x < -0.2 && child.position.y > 0.4);
                const rightArm = this.mesh.children.find(child => 
                    child.position.x > 0.2 && child.position.y > 0.4);
                
                if (leftArm && rightArm) {
                    leftArm.rotation.x = Math.sin(this.animationTime * breathingSpeed) * 0.1;
                    rightArm.rotation.x = Math.sin(this.animationTime * breathingSpeed + Math.PI) * 0.1;
                }
            }
        }
        
        // Handle invulnerability blinking
        if (this.isInvulnerable) {
            this.invulnerabilityTime -= deltaTime;
            
            if (this.invulnerabilityTime <= 0) {
                this.isInvulnerable = false;
                this.setMaterialsOpacity(1.0);
            } else {
                // Blink effect
                const blinkRate = 100; // ms
                const visible = Math.floor(this.invulnerabilityTime / blinkRate) % 2 === 0;
                this.setMaterialsOpacity(visible ? 1.0 : 0.3);
            }
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
        
        try {
            // Place bomb at current grid position with the player's bomb type
            const bomb = new Bomb(this.grid, this.gridX, this.gridY, this.bombRange, this.bombType);
            
            // Add bomb to tracking set
            this.bombs.add(bomb);
            
            // Listen for bomb explosion to restore bomb count
            bomb.onExplode = () => {
                if (this.bombs.has(bomb)) {
                    this.bombs.delete(bomb);
                    console.log("Bomb exploded and removed from tracking, bombs remaining:", this.bombs.size);
                }
            };
        } catch (error) {
            console.error("Error placing bomb:", error);
            // If there was an error, make sure the cell is cleared
            if (this.grid && this.grid.setCellType) {
                this.grid.setCellType(this.gridX, this.gridY, 0);
            }
        }
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
            this.setMaterialsOpacity(0.5);
            
            // Reset after 2 seconds
            setTimeout(() => {
                this.isInvulnerable = false;
                this.setMaterialsOpacity(1.0);
            }, 2000);
            
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
        
        // Create fresh materials based on character type
        let primaryColor, secondaryColor, accentColor, helmetColor, visorColor;
        
        switch (this.characterType) {
            case 'alt':
                primaryColor = 0xff5533;    // Orange-red suit
                secondaryColor = 0xdddddd;  // White details
                accentColor = 0xffcc44;     // Gold accents
                helmetColor = 0xffffff;     // White helmet
                visorColor = 0x3399ff;      // Blue visor
                break;
            case 'girl':
                primaryColor = 0xff66aa;    // Pink suit
                secondaryColor = 0xffffff;  // White details
                accentColor = 0xffdd44;     // Gold accents
                helmetColor = 0xffffff;     // White helmet
                visorColor = 0x99ccff;      // Light blue visor
                break;
            default:
                primaryColor = 0x3366cc;    // Blue suit
                secondaryColor = 0xffffff;  // White details
                accentColor = 0xff9933;     // Orange accents
                helmetColor = 0xffffff;     // White helmet
                visorColor = 0x66ccff;      // Light blue visor
                break;
        }
        
        // Create materials
        this.materials = {
            suit: new THREE.MeshStandardMaterial({
                color: primaryColor,
                roughness: 0.6,
                metalness: 0.2
            }),
            helmet: new THREE.MeshStandardMaterial({
                color: helmetColor,
                roughness: 0.4,
                metalness: 0.3
            }),
            visor: new THREE.MeshStandardMaterial({
                color: visorColor,
                roughness: 0.2,
                metalness: 0.8,
                transparent: true,
                opacity: 0.9
            }),
            detail: new THREE.MeshStandardMaterial({
                color: secondaryColor,
                roughness: 0.5,
                metalness: 0.3
            }),
            accent: new THREE.MeshStandardMaterial({
                color: accentColor,
                roughness: 0.3,
                metalness: 0.8,
                emissive: accentColor,
                emissiveIntensity: 0.2
            }),
            skin: new THREE.MeshStandardMaterial({
                color: 0xffccaa,
                roughness: 0.8,
                metalness: 0.1
            })
        };
        
        // Create new player mesh
        this.mesh = this.createPlayerMesh(getThree());
        
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
    
    setMaterialsOpacity(opacity) {
        // Apply opacity to all player materials
        if (this.mesh && this.mesh.children) {
            this.mesh.children.forEach(child => {
                if (child.material) {
                    child.material.transparent = opacity < 1.0;
                    child.material.opacity = opacity;
                }
            });
        }
    }
    
    switchBombType() {
        // Toggle between default and alt bomb types
        this.bombType = this.bombType === 'default' ? 'alt' : 'default';
        console.log(`Switched to ${this.bombType === 'alt' ? 'Digital' : 'Classic'} bombs`);
        
        // Update the display
        this.updateLivesDisplay();
        
        // Play a sound effect
        if (window.soundManager) {
            window.soundManager.play('powerUp');
        }
    }
    
    handleKeyDown(event) {
        // Skip if player is dead
        if (this.isDead) return;
        
        // Movement keys
        if (event.key === 'ArrowUp' || event.key === 'w') {
            this.moveDirection = 'up';
        } else if (event.key === 'ArrowDown' || event.key === 's') {
            this.moveDirection = 'down';
        } else if (event.key === 'ArrowLeft' || event.key === 'a') {
            this.moveDirection = 'left';
        } else if (event.key === 'ArrowRight' || event.key === 'd') {
            this.moveDirection = 'right';
        }
        
        // Bomb placement
        if (event.key === ' ' || event.key === 'Enter') {
            this.placeBomb();
        }
        
        // Bomb type switching
        if (event.key === 'b' || event.key === 'B') {
            this.switchBombType();
        }
    }
}

export default Player; 
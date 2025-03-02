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
        if (!THREE || !THREE.SphereGeometry || !THREE.CylinderGeometry || !THREE.BoxGeometry || !THREE.TorusGeometry || !THREE.Mesh || !THREE.Group) {
            console.error('Required THREE components are missing:', 
                         'THREE:', !!THREE,
                         'SphereGeometry:', THREE && !!THREE.SphereGeometry,
                         'CylinderGeometry:', THREE && !!THREE.CylinderGeometry,
                         'BoxGeometry:', THREE && !!THREE.BoxGeometry,
                         'TorusGeometry:', THREE && !!THREE.TorusGeometry,
                         'Mesh:', THREE && !!THREE.Mesh,
                         'Group:', THREE && !!THREE.Group);
            throw new Error('THREE.js components required for Enemy mesh are not available');
        }
        
        // Create enemy group
        const enemyGroup = new THREE.Group();
        
        try {
            // Define colors based on enemy level
            let primaryColor, secondaryColor, accentColor, eyeColor;
            
            switch (this.level) {
                case 1: // Red enemy
                    primaryColor = 0xff0000;
                    secondaryColor = 0xaa0000;
                    accentColor = 0xff6600;
                    eyeColor = 0xffff00;
                    break;
                case 2: // Blue enemy
                    primaryColor = 0x0066ff;
                    secondaryColor = 0x0044aa;
                    accentColor = 0x00ffff;
                    eyeColor = 0xaaffff;
                    break;
                default: // Green enemy
                    primaryColor = 0x00cc00;
                    secondaryColor = 0x008800;
                    accentColor = 0x66ff66;
                    eyeColor = 0xccffcc;
                    break;
            }
            
            // Create materials
            const bodyMaterial = new THREE.MeshStandardMaterial({ 
                color: primaryColor,
                roughness: 0.7,
                metalness: 0.3,
                side: THREE.FrontSide
            });
            
            const secondaryMaterial = new THREE.MeshStandardMaterial({ 
                color: secondaryColor,
                roughness: 0.6,
                metalness: 0.4,
                side: THREE.FrontSide
            });
            
            const accentMaterial = new THREE.MeshStandardMaterial({ 
                color: accentColor,
                emissive: accentColor,
                emissiveIntensity: 0.3,
                roughness: 0.4,
                metalness: 0.6,
                side: THREE.FrontSide
            });
            
            // Create enemy body (sphere)
            const bodyGeometry = new THREE.SphereGeometry(0.4, 24, 24);
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.4;
            body.castShadow = true;
            body.receiveShadow = true;
            
            // Create enemy eyes
            const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
            const eyeMaterial = new THREE.MeshStandardMaterial({ 
                color: eyeColor,
                emissive: eyeColor,
                emissiveIntensity: 0.3,
                roughness: 0.3,
                metalness: 0.5
            });
            
            const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            leftEye.position.set(-0.15, 0.5, 0.3);
            leftEye.castShadow = true;
            
            const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            rightEye.position.set(0.15, 0.5, 0.3);
            rightEye.castShadow = true;
            
            // Create enemy pupils
            const pupilGeometry = new THREE.SphereGeometry(0.05, 12, 12);
            const pupilMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x000000,
                roughness: 0.1,
                metalness: 0.1
            });
            
            const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
            leftPupil.position.set(-0.15, 0.5, 0.39);
            
            const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
            rightPupil.position.set(0.15, 0.5, 0.39);
            
            // Add eyebrows (angry expression)
            const eyebrowGeometry = new THREE.BoxGeometry(0.12, 0.03, 0.03);
            const eyebrowMaterial = new THREE.MeshStandardMaterial({
                color: 0x000000,
                roughness: 0.8,
                metalness: 0.1
            });
            
            const leftEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
            leftEyebrow.position.set(-0.15, 0.6, 0.32);
            leftEyebrow.rotation.z = -0.3;
            
            const rightEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
            rightEyebrow.position.set(0.15, 0.6, 0.32);
            rightEyebrow.rotation.z = 0.3;
            
            // Create mouth (evil grin)
            const mouthGeometry = new THREE.TorusGeometry(0.2, 0.03, 8, 12, Math.PI);
            const mouthMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.3,
                metalness: 0.1
            });
            const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
            mouth.position.set(0, 0.35, 0.35);
            mouth.rotation.x = -Math.PI / 2;
            
            // Add teeth
            const teethGeometry = new THREE.BoxGeometry(0.08, 0.05, 0.02);
            const teethMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.3,
                metalness: 0.1
            });
            
            for (let i = -1; i <= 1; i += 2) {
                const tooth = new THREE.Mesh(teethGeometry, teethMaterial);
                tooth.position.set(i * 0.1, 0.35, 0.37);
                enemyGroup.add(tooth);
            }
            
            // Create enemy arms
            const armGeometry = new THREE.CylinderGeometry(0.06, 0.08, 0.3, 8);
            
            const leftArm = new THREE.Mesh(armGeometry, secondaryMaterial);
            leftArm.position.set(-0.35, 0.4, 0);
            leftArm.rotation.z = Math.PI / 2;
            leftArm.castShadow = true;
            
            const rightArm = new THREE.Mesh(armGeometry, secondaryMaterial);
            rightArm.position.set(0.35, 0.4, 0);
            rightArm.rotation.z = -Math.PI / 2;
            rightArm.castShadow = true;
            
            // Create hands
            const handGeometry = new THREE.SphereGeometry(0.1, 12, 12);
            
            const leftHand = new THREE.Mesh(handGeometry, secondaryMaterial);
            leftHand.position.set(-0.5, 0.4, 0);
            leftHand.scale.set(1, 0.8, 1);
            leftHand.castShadow = true;
            
            const rightHand = new THREE.Mesh(handGeometry, secondaryMaterial);
            rightHand.position.set(0.5, 0.4, 0);
            rightHand.scale.set(1, 0.8, 1);
            rightHand.castShadow = true;
            
            // Create enemy legs/feet
            const legGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.25, 8);
            
            const leftLeg = new THREE.Mesh(legGeometry, secondaryMaterial);
            leftLeg.position.set(-0.15, 0.15, 0);
            leftLeg.castShadow = true;
            
            const rightLeg = new THREE.Mesh(legGeometry, secondaryMaterial);
            rightLeg.position.set(0.15, 0.15, 0);
            rightLeg.castShadow = true;
            
            // Create feet
            const footGeometry = new THREE.BoxGeometry(0.15, 0.05, 0.2);
            
            const leftFoot = new THREE.Mesh(footGeometry, secondaryMaterial);
            leftFoot.position.set(-0.15, 0.025, 0.05);
            leftFoot.castShadow = true;
            
            const rightFoot = new THREE.Mesh(footGeometry, secondaryMaterial);
            rightFoot.position.set(0.15, 0.025, 0.05);
            rightFoot.castShadow = true;
            
            // Create belt
            const beltGeometry = new THREE.BoxGeometry(0.5, 0.08, 0.5);
            const belt = new THREE.Mesh(beltGeometry, secondaryMaterial);
            belt.position.set(0, 0.3, 0);
            belt.castShadow = true;
            
            // Create belt buckle
            const buckleGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.05);
            const buckle = new THREE.Mesh(buckleGeometry, accentMaterial);
            buckle.position.set(0, 0.3, 0.25);
            buckle.castShadow = true;
            
            // Add highlights to the body (reflective spots)
            const highlightGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            const highlightMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.1,
                metalness: 0.9,
                opacity: 0.7,
                transparent: true
            });
            
            const highlight1 = new THREE.Mesh(highlightGeometry, highlightMaterial);
            highlight1.position.set(0.2, 0.5, 0.25);
            highlight1.scale.set(1, 0.5, 0.5);
            
            const highlight2 = new THREE.Mesh(highlightGeometry, highlightMaterial);
            highlight2.position.set(-0.15, 0.6, 0.2);
            highlight2.scale.set(0.7, 0.3, 0.3);
            
            // Add level-specific details
            if (this.level >= 2) {
                // Add spikes for higher level enemies
                const spikeGeometry = new THREE.ConeGeometry(0.05, 0.15, 8);
                const spikeMaterial = new THREE.MeshStandardMaterial({
                    color: accentColor,
                    roughness: 0.5,
                    metalness: 0.7
                });
                
                const spikeCount = this.level === 2 ? 3 : 5;
                for (let i = 0; i < spikeCount; i++) {
                    const angle = (i / spikeCount) * Math.PI * 2;
                    const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
                    
                    // Position spikes on top of head
                    spike.position.set(
                        Math.cos(angle) * 0.15,
                        0.7,
                        Math.sin(angle) * 0.15
                    );
                    
                    // Rotate spikes to point outward
                    spike.rotation.x = Math.PI / 2;
                    spike.rotation.z = -angle;
                    
                    enemyGroup.add(spike);
                }
                
                // Add shoulder pads for level 3 enemies
                if (this.level >= 3) {
                    const shoulderPadGeometry = new THREE.SphereGeometry(0.12, 12, 12, 0, Math.PI);
                    const shoulderPadMaterial = new THREE.MeshStandardMaterial({
                        color: accentColor,
                        roughness: 0.4,
                        metalness: 0.7
                    });
                    
                    const leftPad = new THREE.Mesh(shoulderPadGeometry, shoulderPadMaterial);
                    leftPad.position.set(-0.35, 0.5, 0);
                    leftPad.rotation.z = -Math.PI / 2;
                    leftPad.castShadow = true;
                    
                    const rightPad = new THREE.Mesh(shoulderPadGeometry, shoulderPadMaterial);
                    rightPad.position.set(0.35, 0.5, 0);
                    rightPad.rotation.z = Math.PI / 2;
                    rightPad.castShadow = true;
                    
                    enemyGroup.add(leftPad);
                    enemyGroup.add(rightPad);
                }
            }
            
            // Add all parts to the group
            enemyGroup.add(body);
            enemyGroup.add(leftEye);
            enemyGroup.add(rightEye);
            enemyGroup.add(leftPupil);
            enemyGroup.add(rightPupil);
            enemyGroup.add(leftEyebrow);
            enemyGroup.add(rightEyebrow);
            enemyGroup.add(mouth);
            enemyGroup.add(leftArm);
            enemyGroup.add(rightArm);
            enemyGroup.add(leftHand);
            enemyGroup.add(rightHand);
            enemyGroup.add(leftLeg);
            enemyGroup.add(rightLeg);
            enemyGroup.add(leftFoot);
            enemyGroup.add(rightFoot);
            enemyGroup.add(belt);
            enemyGroup.add(buckle);
            enemyGroup.add(highlight1);
            enemyGroup.add(highlight2);
            
            // Store references for animation
            this.leftArm = leftArm;
            this.rightArm = rightArm;
            this.leftLeg = leftLeg;
            this.rightLeg = rightLeg;
            this.leftFoot = leftFoot;
            this.rightFoot = rightFoot;
            this.leftEye = leftEye;
            this.rightEye = rightEye;
            this.leftPupil = leftPupil;
            this.rightPupil = rightPupil;
            this.leftEyebrow = leftEyebrow;
            this.rightEyebrow = rightEyebrow;
            
            // Enable shadows for all parts
            enemyGroup.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.castShadow = true;
                    object.receiveShadow = true;
                }
            });
        } catch (error) {
            console.error('Error creating enemy mesh parts:', error);
            // Fallback to simple box if complex geometry fails
            const bodyGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
            const bodyMaterial = new THREE.MeshStandardMaterial({ 
                color: this.level === 1 ? 0xff0000 :
                       this.level === 2 ? 0x0066ff :
                       0x00cc00,
                roughness: 0.7,
                metalness: 0.3,
                side: THREE.FrontSide
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.castShadow = true;
            body.receiveShadow = true;
            enemyGroup.add(body);
        }
        
        // Set initial position
        enemyGroup.position.set(this.x, 0.4, this.z);
        
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
                
                // Animate walking
                if (this.leftLeg && this.rightLeg) {
                    // Calculate walk cycle based on distance moved
                    const walkCycle = (this.x + this.z) * 5;
                    
                    // Animate legs in opposite phases
                    this.leftLeg.position.y = 0.15 + Math.sin(walkCycle) * 0.05;
                    this.rightLeg.position.y = 0.15 - Math.sin(walkCycle) * 0.05;
                    
                    // Also move feet
                    if (this.leftFoot && this.rightFoot) {
                        this.leftFoot.position.y = 0.025 + Math.sin(walkCycle) * 0.05;
                        this.rightFoot.position.y = 0.025 - Math.sin(walkCycle) * 0.05;
                    }
                    
                    // Animate arms
                    if (this.leftArm && this.rightArm) {
                        this.leftArm.rotation.x = Math.sin(walkCycle) * 0.2;
                        this.rightArm.rotation.x = -Math.sin(walkCycle) * 0.2;
                    }
                }
                
                // Slightly bob the body up and down
                this.mesh.position.y = 0.4 + Math.abs(Math.sin(distance * 10)) * 0.03;
            }
        } else {
            // Idle animation
            const idleTime = Date.now() * 0.001;
            
            // Subtle breathing animation
            if (this.mesh) {
                this.mesh.position.y = 0.4 + Math.sin(idleTime * 2) * 0.01;
            }
            
            // Animate eyes looking around
            if (this.leftPupil && this.rightPupil) {
                const lookX = Math.sin(idleTime * 0.5) * 0.03;
                const lookZ = Math.cos(idleTime * 0.7) * 0.02;
                
                this.leftPupil.position.x = -0.15 + lookX;
                this.leftPupil.position.z = 0.39 + lookZ;
                
                this.rightPupil.position.x = 0.15 + lookX;
                this.rightPupil.position.z = 0.39 + lookZ;
            }
            
            // Occasionally blink
            if (this.leftEye && this.rightEye && Math.random() < 0.005) {
                // Store original scale
                const originalScaleY = this.leftEye.scale.y;
                
                // Blink animation
                this.leftEye.scale.y = 0.1;
                this.rightEye.scale.y = 0.1;
                
                // Reset after a short delay
                setTimeout(() => {
                    if (this.leftEye && this.rightEye) {
                        this.leftEye.scale.y = originalScaleY;
                        this.rightEye.scale.y = originalScaleY;
                    }
                }, 100);
            }
            
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
        
        // Find player
        const player = this.grid.entities.find(e => e.constructor.name === 'Player');
        if (!player) return;
        
        // Different AI behavior based on enemy level
        switch(this.level) {
            case 1: // Basic AI - moves randomly with slight preference for player direction
                // Try to move towards player if on same row/column
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
                
                // If can't move towards player, choose random valid direction
                const validDirections = directions.filter(dir => this.canMove(dir));
                if (validDirections.length > 0) {
                    const randomDir = validDirections[Math.floor(Math.random() * validDirections.length)];
                    this.move(randomDir);
                }
                break;
                
            case 2: // Intermediate AI - tries to find path to player
                // Calculate distance to player in each direction
                const distanceToPlayer = Math.abs(this.gridX - player.gridX) + Math.abs(this.gridY - player.gridY);
                
                // If player is close, try to move directly towards them
                if (distanceToPlayer < 8) {
                    // Prioritize directions that get us closer to the player
                    const directionScores = directions.map(dir => {
                        if (!this.canMove(dir)) return { dir, score: -1 }; // Can't move this way
                        
                        let newX = this.gridX;
                        let newY = this.gridY;
                        
                        switch(dir) {
                            case 'up': newY--; break;
                            case 'down': newY++; break;
                            case 'left': newX--; break;
                            case 'right': newX++; break;
                        }
                        
                        // Calculate new distance to player
                        const newDistance = Math.abs(newX - player.gridX) + Math.abs(newY - player.gridY);
                        
                        // Score is better if we get closer to player
                        const score = distanceToPlayer - newDistance;
                        
                        return { dir, score };
                    });
                    
                    // Sort by score (higher is better)
                    directionScores.sort((a, b) => b.score - a.score);
                    
                    // Try to move in the best direction, or random if all are equal
                    for (const { dir, score } of directionScores) {
                        if (score > 0) {
                            this.move(dir);
                            return;
                        }
                    }
                }
                
                // If no good direction found, move randomly but avoid going back
                const validDirectionsLevel2 = directions.filter(dir => this.canMove(dir));
                if (validDirectionsLevel2.length > 0) {
                    const randomDir = validDirectionsLevel2[Math.floor(Math.random() * validDirectionsLevel2.length)];
                    this.move(randomDir);
                }
                break;
                
            case 3: // Advanced AI - aggressive pathfinding and bomb avoidance
                // Check if there are bombs nearby and avoid them
                const bombs = this.grid.entities.filter(e => e.constructor.name === 'Bomb');
                const nearbyBomb = bombs.find(bomb => 
                    Math.abs(bomb.gridX - this.gridX) + Math.abs(bomb.gridY - this.gridY) < 3
                );
                
                if (nearbyBomb) {
                    // Try to move away from bomb
                    const directionScores = directions.map(dir => {
                        if (!this.canMove(dir)) return { dir, score: -1 }; // Can't move this way
                        
                        let newX = this.gridX;
                        let newY = this.gridY;
                        
                        switch(dir) {
                            case 'up': newY--; break;
                            case 'down': newY++; break;
                            case 'left': newX--; break;
                            case 'right': newX++; break;
                        }
                        
                        // Calculate distance to bomb
                        const distanceToBomb = Math.abs(newX - nearbyBomb.gridX) + Math.abs(newY - nearbyBomb.gridY);
                        
                        return { dir, score: distanceToBomb };
                    });
                    
                    // Sort by score (higher is better - further from bomb)
                    directionScores.sort((a, b) => b.score - a.score);
                    
                    // Move in the direction that takes us furthest from the bomb
                    if (directionScores[0].score > 0) {
                        this.move(directionScores[0].dir);
                        return;
                    }
                }
                
                // If no bombs to avoid, use advanced pathfinding to player
                // Calculate distance to player in each direction
                const playerDistance = Math.abs(this.gridX - player.gridX) + Math.abs(this.gridY - player.gridY);
                
                // If player is within range, aggressively pursue
                if (playerDistance < 12) {
                    // Prioritize directions that get us closer to the player
                    const directionScores = directions.map(dir => {
                        if (!this.canMove(dir)) return { dir, score: -1 }; // Can't move this way
                        
                        let newX = this.gridX;
                        let newY = this.gridY;
                        
                        switch(dir) {
                            case 'up': newY--; break;
                            case 'down': newY++; break;
                            case 'left': newX--; break;
                            case 'right': newX++; break;
                        }
                        
                        // Calculate new distance to player
                        const newDistance = Math.abs(newX - player.gridX) + Math.abs(newY - player.gridY);
                        
                        // Score is better if we get closer to player
                        const score = playerDistance - newDistance;
                        
                        // Add bonus for moving towards player
                        const bonus = (newX === player.gridX || newY === player.gridY) ? 2 : 0;
                        
                        return { dir, score: score + bonus };
                    });
                    
                    // Sort by score (higher is better)
                    directionScores.sort((a, b) => b.score - a.score);
                    
                    // Try to move in the best direction
                    if (directionScores[0].score > 0) {
                        this.move(directionScores[0].dir);
                        return;
                    }
                }
                
                // If no good direction found, move randomly but intelligently
                const validDirsLevel3 = directions.filter(dir => this.canMove(dir));
                if (validDirsLevel3.length > 0) {
                    // Prefer directions that don't lead to dead ends
                    const smartDirections = validDirsLevel3.filter(dir => {
                        let newX = this.gridX;
                        let newY = this.gridY;
                        
                        switch(dir) {
                            case 'up': newY--; break;
                            case 'down': newY++; break;
                            case 'left': newX--; break;
                            case 'right': newX++; break;
                        }
                        
                        // Count available moves from the new position
                        let availableMoves = 0;
                        if (this.grid.isCellWalkable(newX, newY - 1)) availableMoves++;
                        if (this.grid.isCellWalkable(newX, newY + 1)) availableMoves++;
                        if (this.grid.isCellWalkable(newX - 1, newY)) availableMoves++;
                        if (this.grid.isCellWalkable(newX + 1, newY)) availableMoves++;
                        
                        // Prefer positions with more than 1 exit
                        return availableMoves > 1;
                    });
                    
                    // Use smart directions if available, otherwise use any valid direction
                    const directionsToUse = smartDirections.length > 0 ? smartDirections : validDirsLevel3;
                    const randomDir = directionsToUse[Math.floor(Math.random() * directionsToUse.length)];
                    this.move(randomDir);
                }
                break;
                
            default:
                // Fallback to basic AI
                const validDirsDefault = directions.filter(dir => this.canMove(dir));
                if (validDirsDefault.length > 0) {
                    const randomDir = validDirsDefault[Math.floor(Math.random() * validDirsDefault.length)];
                    this.move(randomDir);
                }
                break;
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
                emissiveIntensity: 0.7,
                transparent: true,
                opacity: 1.0,
                alphaTest: 0.1,
                side: THREE.FrontSide
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
                        // Only reduce opacity in the last half of lifetime
                        if (this.lifetime < 500) {
                            particle.material.opacity = this.lifetime / 500;
                        }
                        
                        // Add rotation for better visual effect
                        particle.rotation.x += 0.02;
                        particle.rotation.y += 0.02;
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
            // Import levels if needed
            const levels = window.levels || [];
            
            if (window.currentLevel < levels.length) {
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
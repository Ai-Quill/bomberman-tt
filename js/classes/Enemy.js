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
                case 1:
                    primaryColor = 0xff5544;    // Brighter red (was 0xff3333)
                    secondaryColor = 0xff9977;  // Brighter light red (was 0xff8866)
                    accentColor = 0xffdd44;     // Brighter gold (was 0xffcc33)
                    eyeColor = 0xffff00;        // Bright yellow eyes (was 0xffee00)
                    break;
                case 2:
                    primaryColor = 0x5599ff;    // Brighter blue (was 0x3377ff)
                    secondaryColor = 0x99ccff;  // Brighter light blue (was 0x77aaff)
                    accentColor = 0x44ffdd;     // Brighter cyan (was 0x33ffcc)
                    eyeColor = 0x00ffff;        // Bright cyan eyes (was 0x00eeee)
                    break;
                default: // Level 3
                    primaryColor = 0x55dd55;    // Brighter green (was 0x33cc33)
                    secondaryColor = 0x99ff99;  // Brighter light green (was 0x77ee77)
                    accentColor = 0xffff44;     // Brighter yellow (was 0xffff33)
                    eyeColor = 0xffff00;        // Bright yellow eyes (was 0xffee00)
                    break;
            }
            
            // Create materials
            const bodyMaterial = new THREE.MeshStandardMaterial({
                color: primaryColor,
                roughness: 0.5,  // Reduced roughness (was 0.6)
                metalness: 0.3,  // Increased metalness (was 0.2)
                emissive: primaryColor,  // Add emissive glow
                emissiveIntensity: 0.2   // Subtle glow
            });
            
            const secondaryMaterial = new THREE.MeshStandardMaterial({
                color: secondaryColor,
                roughness: 0.4,  // Reduced roughness (was 0.5)
                metalness: 0.3   // Increased metalness (was 0.2)
            });
            
            const accentMaterial = new THREE.MeshStandardMaterial({
                color: accentColor,
                roughness: 0.2,  // Reduced roughness (was 0.3)
                metalness: 0.8,  // Increased metalness (was 0.7)
                emissive: accentColor,
                emissiveIntensity: 0.3  // Added glow (was 0.0)
            });
            
            const eyeMaterial = new THREE.MeshStandardMaterial({
                color: eyeColor,
                roughness: 0.1,  // Reduced roughness (was 0.2)
                metalness: 0.9,  // Increased metalness (was 0.8)
                emissive: eyeColor,
                emissiveIntensity: 0.5  // Increased glow (was 0.3)
            });
            
            // Define missing materials
            const pupilMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x000000,
                roughness: 0.1,
                metalness: 0.1,
                emissive: 0x000000,
                emissiveIntensity: 0.2
            });
            
            const eyebrowMaterial = new THREE.MeshStandardMaterial({
                color: 0x000000,
                roughness: 0.8,
                metalness: 0.1
            });
            
            const mouthMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.3,
                metalness: 0.1
            });
            
            // Create enemy body (sphere)
            const bodyGeometry = new THREE.SphereGeometry(0.4, 24, 24);
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.4;
            body.castShadow = true;
            body.receiveShadow = true;
            
            // Add a hat or crown based on enemy level
            if (this.level >= 2) {
                let hatGeometry;
                let hatMaterial;
                
                if (this.level === 2) {
                    // Level 2 gets a wizard hat
                    hatGeometry = new THREE.ConeGeometry(0.25, 0.4, 8);
                    hatMaterial = new THREE.MeshStandardMaterial({
                        color: accentColor,
                        roughness: 0.3,
                        metalness: 0.7,
                        emissive: accentColor,
                        emissiveIntensity: 0.3
                    });
                } else {
                    // Level 3 gets a crown
                    hatGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.15, 8);
                    hatMaterial = new THREE.MeshStandardMaterial({
                        color: 0xffdd44, // Gold crown
                        roughness: 0.2,
                        metalness: 0.9,
                        emissive: 0xffdd44,
                        emissiveIntensity: 0.4
                    });
                }
                
                const hat = new THREE.Mesh(hatGeometry, hatMaterial);
                hat.position.y = 0.8;
                hat.castShadow = true;
                enemyGroup.add(hat);
                
                // Add crown spikes or hat decoration
                if (this.level === 3) {
                    // Crown spikes
                    const spikeGeometry = new THREE.ConeGeometry(0.05, 0.15, 4);
                    const spikeMaterial = new THREE.MeshStandardMaterial({
                        color: 0xffdd44,
                        roughness: 0.2,
                        metalness: 0.9,
                        emissive: 0xffdd44,
                        emissiveIntensity: 0.4
                    });
                    
                    for (let i = 0; i < 5; i++) {
                        const angle = (i / 5) * Math.PI * 2;
                        const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
                        spike.position.set(
                            Math.cos(angle) * 0.25,
                            0.9,
                            Math.sin(angle) * 0.25
                        );
                        spike.castShadow = true;
                        enemyGroup.add(spike);
                    }
                    
                    // Add a gem to the crown
                    const gemGeometry = new THREE.OctahedronGeometry(0.08, 1);
                    const gemMaterial = new THREE.MeshStandardMaterial({
                        color: 0xff0088,
                        roughness: 0.1,
                        metalness: 0.9,
                        emissive: 0xff0088,
                        emissiveIntensity: 0.6
                    });
                    
                    const gem = new THREE.Mesh(gemGeometry, gemMaterial);
                    gem.position.set(0, 0.95, 0.15);
                    gem.castShadow = true;
                    enemyGroup.add(gem);
                } else {
                    // Hat star for level 2
                    const starGeometry = new THREE.OctahedronGeometry(0.08, 0);
                    const starMaterial = new THREE.MeshStandardMaterial({
                        color: 0xffff00,
                        roughness: 0.1,
                        metalness: 0.9,
                        emissive: 0xffff00,
                        emissiveIntensity: 0.6
                    });
                    
                    const star = new THREE.Mesh(starGeometry, starMaterial);
                    star.position.set(0, 1.05, 0);
                    star.castShadow = true;
                    enemyGroup.add(star);
                }
            }
            
            // Add a cape for level 3 enemies
            if (this.level === 3) {
                const capeGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.6, 8, 1, true, Math.PI/2, Math.PI);
                const capeMaterial = new THREE.MeshStandardMaterial({
                    color: accentColor,
                    roughness: 0.7,
                    metalness: 0.2,
                    side: THREE.DoubleSide,
                    emissive: accentColor,
                    emissiveIntensity: 0.2
                });
                
                const cape = new THREE.Mesh(capeGeometry, capeMaterial);
                cape.position.set(0, 0.4, -0.2);
                cape.rotation.x = Math.PI / 10;
                cape.castShadow = true;
                enemyGroup.add(cape);
            }
            
            // Create enemy eyes
            const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
            const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            leftEye.position.set(-0.15, 0.5, 0.3);
            leftEye.castShadow = true;
            
            const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            rightEye.position.set(0.15, 0.5, 0.3);
            rightEye.castShadow = true;
            
            // Create enemy pupils
            const pupilGeometry = new THREE.SphereGeometry(0.05, 12, 12);
            const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
            leftPupil.position.set(-0.15, 0.5, 0.39);
            
            const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
            rightPupil.position.set(0.15, 0.5, 0.39);
            
            // Add eyebrows (angry expression)
            const eyebrowGeometry = new THREE.BoxGeometry(0.12, 0.03, 0.03);
            const leftEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
            leftEyebrow.position.set(-0.15, 0.6, 0.32);
            leftEyebrow.rotation.z = -0.3;
            
            const rightEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
            rightEyebrow.position.set(0.15, 0.6, 0.32);
            rightEyebrow.rotation.z = 0.3;
            
            // Create mouth (evil grin)
            const mouthGeometry = new THREE.TorusGeometry(0.2, 0.03, 8, 12, Math.PI);
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
            
            // Add weapon for level 2 and 3 enemies
            if (this.level >= 2) {
                let weaponGeometry, weaponMaterial;
                
                if (this.level === 2) {
                    // Magic wand for level 2
                    weaponGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8);
                    weaponMaterial = new THREE.MeshStandardMaterial({
                        color: 0x663300,
                        roughness: 0.7,
                        metalness: 0.3
                    });
                    
                    const wand = new THREE.Mesh(weaponGeometry, weaponMaterial);
                    wand.position.set(0.6, 0.4, 0);
                    wand.rotation.z = -Math.PI / 2;
                    wand.castShadow = true;
                    enemyGroup.add(wand);
                    
                    // Add wand tip
                    const tipGeometry = new THREE.SphereGeometry(0.04, 8, 8);
                    const tipMaterial = new THREE.MeshStandardMaterial({
                        color: accentColor,
                        roughness: 0.1,
                        metalness: 0.9,
                        emissive: accentColor,
                        emissiveIntensity: 0.8
                    });
                    
                    const tip = new THREE.Mesh(tipGeometry, tipMaterial);
                    tip.position.set(0.8, 0.4, 0);
                    tip.castShadow = true;
                    enemyGroup.add(tip);
                    
                    // Add magic particles
                    const particleGroup = new THREE.Group();
                    const particleCount = 5;
                    const particleGeometry = new THREE.SphereGeometry(0.02, 4, 4);
                    const particleMaterial = new THREE.MeshStandardMaterial({
                        color: accentColor,
                        roughness: 0.1,
                        metalness: 0.9,
                        emissive: accentColor,
                        emissiveIntensity: 0.8,
                        transparent: true,
                        opacity: 0.8
                    });
                    
                    for (let i = 0; i < particleCount; i++) {
                        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
                        const angle = Math.random() * Math.PI * 2;
                        const radius = 0.05 + Math.random() * 0.05;
                        particle.position.set(
                            0.8 + Math.cos(angle) * radius,
                            0.4 + Math.sin(angle) * radius,
                            Math.random() * 0.1 - 0.05
                        );
                        particle.userData = {
                            angle: Math.random() * Math.PI * 2,
                            radius: radius,
                            speed: 0.01 + Math.random() * 0.02,
                            centerX: 0.8,
                            centerY: 0.4
                        };
                        particleGroup.add(particle);
                    }
                    
                    enemyGroup.add(particleGroup);
                    this.magicParticles = particleGroup;
                } else {
                    // Trident/scepter for level 3
                    weaponGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
                    weaponMaterial = new THREE.MeshStandardMaterial({
                        color: 0xdddddd,
                        roughness: 0.2,
                        metalness: 0.9
                    });
                    
                    const scepter = new THREE.Mesh(weaponGeometry, weaponMaterial);
                    scepter.position.set(0.6, 0.4, 0);
                    scepter.rotation.z = -Math.PI / 2;
                    scepter.castShadow = true;
                    enemyGroup.add(scepter);
                    
                    // Add trident head
                    const headGeometry = new THREE.ConeGeometry(0.06, 0.15, 3);
                    const headMaterial = new THREE.MeshStandardMaterial({
                        color: 0xffdd44,
                        roughness: 0.2,
                        metalness: 0.9,
                        emissive: 0xffdd44,
                        emissiveIntensity: 0.4
                    });
                    
                    const head = new THREE.Mesh(headGeometry, headMaterial);
                    head.position.set(0.85, 0.4, 0);
                    head.rotation.z = -Math.PI / 2;
                    head.castShadow = true;
                    enemyGroup.add(head);
                    
                    // Add side prongs
                    for (let i = -1; i <= 1; i += 2) {
                        const prongGeometry = new THREE.ConeGeometry(0.04, 0.12, 3);
                        const prong = new THREE.Mesh(prongGeometry, headMaterial);
                        prong.position.set(0.8, 0.4 + (i * 0.08), 0);
                        prong.rotation.z = -Math.PI / 2;
                        prong.castShadow = true;
                        enemyGroup.add(prong);
                    }
                }
            }
            
            // Add aura effect for level 3 enemies
            if (this.level === 3) {
                const auraGeometry = new THREE.SphereGeometry(0.5, 16, 16);
                const auraMaterial = new THREE.MeshStandardMaterial({
                    color: accentColor,
                    roughness: 1.0,
                    metalness: 0.0,
                    transparent: true,
                    opacity: 0.3,
                    side: THREE.DoubleSide,
                    emissive: accentColor,
                    emissiveIntensity: 0.5
                });
                
                const aura = new THREE.Mesh(auraGeometry, auraMaterial);
                aura.position.y = 0.4;
                aura.scale.set(1.2, 1.2, 1.2);
                enemyGroup.add(aura);
                
                // Store for animation
                this.aura = aura;
            }
            
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
            
            // Animate magic particles for level 2 enemies
            if (this.level === 2 && this.magicParticles) {
                this.magicParticles.children.forEach(particle => {
                    if (particle.userData) {
                        // Update angle
                        particle.userData.angle += particle.userData.speed;
                        
                        // Calculate new position
                        const x = particle.userData.centerX + Math.cos(particle.userData.angle) * particle.userData.radius;
                        const y = particle.userData.centerY + Math.sin(particle.userData.angle) * particle.userData.radius;
                        
                        // Update position
                        particle.position.set(x, y, particle.position.z);
                        
                        // Pulse size
                        const scale = 0.8 + Math.sin(Date.now() * 0.01 + particle.userData.angle) * 0.2;
                        particle.scale.set(scale, scale, scale);
                    }
                });
            }
            
            // Animate aura for level 3 enemies
            if (this.level === 3 && this.aura) {
                // Pulse the aura
                const pulseScale = 1.2 + Math.sin(idleTime * 3) * 0.1;
                this.aura.scale.set(pulseScale, pulseScale, pulseScale);
                
                // Rotate the aura slightly
                this.aura.rotation.y += 0.005;
                
                // Pulse opacity
                if (this.aura.material) {
                    this.aura.material.opacity = 0.2 + Math.abs(Math.sin(idleTime * 2)) * 0.2;
                }
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
        const particleCount = 15 + (this.level * 5); // More particles for higher level enemies
        const particles = new THREE.Group();
        
        // Get enemy color based on level
        const enemyColor = this.level === 1 ? 0xff5544 : 
                          this.level === 2 ? 0x5599ff : 
                          0x55dd55;
        
        // Get accent color based on level
        const accentColor = this.level === 1 ? 0xffdd44 : 
                           this.level === 2 ? 0x44ffdd : 
                           0xffff44;
        
        // Create main explosion particles
        for (let i = 0; i < particleCount; i++) {
            const size = 0.05 + Math.random() * 0.15;
            const geometry = new THREE.SphereGeometry(size, 8, 8);
            const material = new THREE.MeshStandardMaterial({
                color: i % 3 === 0 ? accentColor : enemyColor,
                emissive: i % 3 === 0 ? accentColor : enemyColor,
                emissiveIntensity: 0.8,
                transparent: true,
                opacity: 1.0,
                alphaTest: 0.1,
                side: THREE.FrontSide
            });
            
            const particle = new THREE.Mesh(geometry, material);
            
            // Distribute particles in a sphere
            const phi = Math.acos(-1 + (2 * i) / particleCount);
            const theta = Math.sqrt(particleCount * Math.PI) * phi;
            const radius = 0.1 + Math.random() * 0.3;
            
            particle.position.set(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi)
            );
            
            // Add velocity for animation
            particle.userData.velocity = {
                x: particle.position.x * (0.03 + Math.random() * 0.03),
                y: particle.position.y * (0.03 + Math.random() * 0.03) + 0.05,
                z: particle.position.z * (0.03 + Math.random() * 0.03)
            };
            
            // Add rotation for animation
            particle.userData.rotation = {
                x: Math.random() * 0.1,
                y: Math.random() * 0.1,
                z: Math.random() * 0.1
            };
            
            particles.add(particle);
        }
        
        // Add level-specific death effects
        if (this.level >= 2) {
            // Add energy ring for level 2+
            const ringGeometry = new THREE.TorusGeometry(0.3, 0.05, 8, 24);
            const ringMaterial = new THREE.MeshStandardMaterial({
                color: accentColor,
                emissive: accentColor,
                emissiveIntensity: 0.9,
                transparent: true,
                opacity: 1.0
            });
            
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            ring.userData.scale = 0.1;
            ring.userData.expandRate = 0.05;
            ring.scale.set(0.1, 0.1, 0.1);
            particles.add(ring);
            
            // Add second ring perpendicular to first
            if (this.level === 3) {
                const ring2 = new THREE.Mesh(ringGeometry, ringMaterial.clone());
                ring2.rotation.y = Math.PI / 2;
                ring2.userData.scale = 0.1;
                ring2.userData.expandRate = 0.04;
                ring2.scale.set(0.1, 0.1, 0.1);
                particles.add(ring2);
                
                // Add third ring for level 3
                const ring3 = new THREE.Mesh(ringGeometry, ringMaterial.clone());
                ring3.userData.scale = 0.1;
                ring3.userData.expandRate = 0.06;
                ring3.scale.set(0.1, 0.1, 0.1);
                particles.add(ring3);
            }
        }
        
        particles.position.set(this.x, 0.4, this.z);
        window.scene.add(particles);
        
        // Add particle system to grid entities
        const particleSystem = {
            mesh: particles,
            lifetime: 1500, // Longer lifetime for more impressive effect
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
                    // Handle expanding rings differently
                    if (particle.userData.expandRate) {
                        // Expand the ring
                        particle.userData.scale += particle.userData.expandRate;
                        particle.scale.set(
                            particle.userData.scale, 
                            particle.userData.scale, 
                            particle.userData.scale
                        );
                        
                        // Fade out as it expands
                        if (particle.material) {
                            particle.material.opacity = Math.min(1.0, this.lifetime / 1000);
                        }
                        
                        // Add some rotation
                        particle.rotation.z += 0.01;
                        return;
                    }
                    
                    // Regular particles
                    if (particle.userData.velocity) {
                        particle.position.x += particle.userData.velocity.x;
                        particle.position.y += particle.userData.velocity.y;
                        particle.position.z += particle.userData.velocity.z;
                        
                        // Add gravity
                        particle.userData.velocity.y -= 0.001;
                        
                        // Add rotation
                        if (particle.userData.rotation) {
                            particle.rotation.x += particle.userData.rotation.x;
                            particle.rotation.y += particle.userData.rotation.y;
                            particle.rotation.z += particle.userData.rotation.z;
                        }
                        
                        // Fade out
                        if (particle.material) {
                            particle.material.opacity = this.lifetime / 1500;
                        }
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
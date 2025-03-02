import Explosion from './Explosion.js';

// Function to safely get THREE from window object
function getThree() {
    if (!window.THREE) {
        console.error('THREE is not defined in window object');
        throw new Error('THREE.js is not loaded. Please refresh the page and try again.');
    }
    return window.THREE;
}

class Bomb {
    constructor(grid, x, y, range, bombType = 'default') {
        try {
            // Get THREE safely
            const THREE = getThree();
            
            this.grid = grid;
            this.gridX = x;
            this.gridY = y;
            this.range = range;
            this.timer = 2000; // 2 seconds
            this.exploded = false;
            this.removed = false;
            this.bombType = bombType;
            
            // Set bomb in grid
            this.grid.setCellType(x, y, 3); // 3 = bomb
            
            // Create bomb mesh
            const worldPos = grid.gridToWorld(x, y);
            this.mesh = this.createBombMesh(THREE);
            this.mesh.position.set(worldPos.x, 0.4, worldPos.z);
            window.scene.add(this.mesh);
            
            // Add to grid entities
            grid.addEntity(this);
            
            // Play bomb place sound
            if (window.soundManager) {
                window.soundManager.play('bombPlace');
            }
        } catch (error) {
            console.error('Error creating bomb:', error);
            throw error;
        }
    }
    
    createBombMesh(THREE) {
        if (!THREE || !THREE.SphereGeometry || !THREE.CylinderGeometry || !THREE.BoxGeometry || !THREE.TorusGeometry || !THREE.Mesh || !THREE.Group) {
            console.error('Required THREE components are missing:', 
                         'THREE:', !!THREE,
                         'SphereGeometry:', THREE && !!THREE.SphereGeometry,
                         'CylinderGeometry:', THREE && !!THREE.CylinderGeometry,
                         'BoxGeometry:', THREE && !!THREE.BoxGeometry,
                         'TorusGeometry:', THREE && !!THREE.TorusGeometry,
                         'Mesh:', THREE && !!THREE.Mesh,
                         'Group:', THREE && !!THREE.Group);
            throw new Error('THREE.js components required for Bomb mesh are not available');
        }
        
        // Create bomb group
        const bombGroup = new THREE.Group();
        
        try {
            // Select texture based on bomb type
            const bombTexture = this.bombType === 'alt' ? window.textures.bombAlt : window.textures.bomb;
            
            if (this.bombType === 'alt') {
                // Create digital bomb (alternative style)
                
                // Create bomb body (box with rounded corners)
                const bodyGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.6);
                const bodyMaterial = new THREE.MeshStandardMaterial({
                    color: 0x333333,
                    roughness: 0.3,
                    metalness: 0.8,
                    side: THREE.FrontSide
                });
                const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
                body.castShadow = true;
                body.receiveShadow = true;
                
                // Create digital display
                const displayGeometry = new THREE.PlaneGeometry(0.3, 0.2);
                const displayMaterial = new THREE.MeshStandardMaterial({
                    color: 0x00ff00,
                    emissive: 0x00ff00,
                    emissiveIntensity: 0.8,
                    roughness: 0.3,
                    metalness: 0.8
                });
                
                // Create four display panels for each side
                for (let i = 0; i < 4; i++) {
                    const display = new THREE.Mesh(displayGeometry, displayMaterial);
                    display.position.y = 0.05;
                    
                    // Position on each side of the bomb
                    switch (i) {
                        case 0: // Front
                            display.position.z = 0.31;
                            break;
                        case 1: // Back
                            display.position.z = -0.31;
                            display.rotation.y = Math.PI;
                            break;
                        case 2: // Left
                            display.position.x = -0.31;
                            display.rotation.y = -Math.PI / 2;
                            break;
                        case 3: // Right
                            display.position.x = 0.31;
                            display.rotation.y = Math.PI / 2;
                            break;
                    }
                    
                    bombGroup.add(display);
                }
                
                // Create antenna
                const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
                const antennaMaterial = new THREE.MeshStandardMaterial({
                    color: 0x333333,
                    roughness: 0.7,
                    metalness: 0.5
                });
                const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
                antenna.position.y = 0.35;
                antenna.castShadow = true;
                
                // Create antenna tip (blinking light)
                const tipGeometry = new THREE.SphereGeometry(0.04, 8, 8);
                const tipMaterial = new THREE.MeshStandardMaterial({
                    color: 0xff0000,
                    emissive: 0xff0000,
                    emissiveIntensity: 0.8,
                    roughness: 0.3,
                    metalness: 0.3
                });
                const tip = new THREE.Mesh(tipGeometry, tipMaterial);
                tip.position.y = 0.5;
                tip.castShadow = true;
                
                // Add metal details to the body
                const detailMaterial = new THREE.MeshStandardMaterial({
                    color: 0x888888,
                    roughness: 0.2,
                    metalness: 0.9
                });
                
                // Add corner details
                for (let x = -1; x <= 1; x += 2) {
                    for (let z = -1; z <= 1; z += 2) {
                        const cornerGeometry = new THREE.SphereGeometry(0.05, 8, 8);
                        const corner = new THREE.Mesh(cornerGeometry, detailMaterial);
                        corner.position.set(x * 0.3, 0, z * 0.3);
                        bombGroup.add(corner);
                    }
                }
                
                // Add buttons
                const buttonGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8);
                const buttonMaterial = new THREE.MeshStandardMaterial({
                    color: 0xff0000,
                    roughness: 0.3,
                    metalness: 0.5,
                    emissive: 0xff0000,
                    emissiveIntensity: 0.5
                });
                
                const button1 = new THREE.Mesh(buttonGeometry, buttonMaterial);
                button1.rotation.x = Math.PI / 2;
                button1.position.set(0.2, 0.2, 0.31);
                
                const button2 = new THREE.Mesh(buttonGeometry, buttonMaterial);
                button2.rotation.x = Math.PI / 2;
                button2.position.set(-0.2, 0.2, 0.31);
                
                bombGroup.add(button1);
                bombGroup.add(button2);
                
                // Add all parts to the group
                bombGroup.add(body);
                bombGroup.add(antenna);
                bombGroup.add(tip);
                
                // Store tip reference for animation
                this.tip = tip;
                this.displays = [];
                bombGroup.children.forEach(child => {
                    if (child.material && child.material.emissive && child.material.emissive.equals(new THREE.Color(0x00ff00))) {
                        this.displays.push(child);
                    }
                });
                
            } else {
                // Create classic bomb (default style) - based on the image shared
                
                // Create bomb body (sphere)
                const bodyGeometry = new THREE.SphereGeometry(0.35, 24, 24);
                const bodyMaterial = new THREE.MeshStandardMaterial({
                    color: 0x1a1a2e,  // Dark blue-black color
                    roughness: 0.7,
                    metalness: 0.3,
                    side: THREE.DoubleSide,
                    transparent: true,
                    alphaTest: 0.5
                });
                const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
                body.castShadow = true;
                body.receiveShadow = true;
                
                // Create bomb cap (cylinder)
                const capGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.08, 16);
                const capMaterial = new THREE.MeshStandardMaterial({
                    color: 0x333333,
                    roughness: 0.5,
                    metalness: 0.7,
                    side: THREE.DoubleSide,
                    transparent: true,
                    alphaTest: 0.5
                });
                const cap = new THREE.Mesh(capGeometry, capMaterial);
                cap.position.y = 0.35;
                cap.castShadow = true;
                cap.receiveShadow = true;
                
                // Create bomb fuse (cylinder with slight curve)
                const fuseGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8);
                const fuseMaterial = new THREE.MeshStandardMaterial({
                    color: 0x8B4513,  // Brown color for fuse
                    roughness: 0.9,
                    metalness: 0.1,
                    side: THREE.DoubleSide,
                    transparent: true,
                    alphaTest: 0.5
                });
                const fuse = new THREE.Mesh(fuseGeometry, fuseMaterial);
                fuse.position.y = 0.5;
                fuse.rotation.x = 0.1;
                fuse.rotation.z = 0.2;
                fuse.castShadow = true;
                
                // Create flame (teardrop shape using cone)
                const flameGeometry = new THREE.ConeGeometry(0.08, 0.25, 16);
                const flameMaterial = new THREE.MeshStandardMaterial({
                    color: 0xff9500,  // Orange base color
                    emissive: 0xff5500,  // Red-orange glow
                    emissiveIntensity: 0.8,
                    roughness: 0.3,
                    metalness: 0.3,
                    side: THREE.DoubleSide,
                    transparent: true,
                    alphaTest: 0.5
                });
                const flame = new THREE.Mesh(flameGeometry, flameMaterial);
                flame.position.y = 0.65;
                flame.position.x = 0.02;
                flame.position.z = 0.03;
                flame.castShadow = true;
                
                // Create inner flame (yellow-white center)
                const innerFlameGeometry = new THREE.ConeGeometry(0.04, 0.15, 12);
                const innerFlameMaterial = new THREE.MeshStandardMaterial({
                    color: 0xffff00,  // Yellow color
                    emissive: 0xffffaa,  // Yellow-white glow
                    emissiveIntensity: 1.0,
                    roughness: 0.2,
                    metalness: 0.2,
                    side: THREE.DoubleSide,
                    transparent: true,
                    alphaTest: 0.5
                });
                const innerFlame = new THREE.Mesh(innerFlameGeometry, innerFlameMaterial);
                innerFlame.position.y = 0.62;
                innerFlame.position.x = 0.02;
                innerFlame.position.z = 0.03;
                innerFlame.castShadow = false;  // Inner flame doesn't cast shadow
                
                // Add small flame particles (small spheres)
                const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
                const particleMaterial = new THREE.MeshStandardMaterial({
                    color: 0xff3300,
                    emissive: 0xff3300,
                    emissiveIntensity: 1.0,
                    roughness: 0.2,
                    metalness: 0.2,
                    side: THREE.DoubleSide,
                    transparent: true,
                    alphaTest: 0.5
                });
                
                // Create several flame particles
                const particles = [];
                for (let i = 0; i < 5; i++) {
                    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
                    const angle = Math.random() * Math.PI * 2;
                    const radius = 0.03 + Math.random() * 0.03;
                    const height = 0.6 + Math.random() * 0.15;
                    
                    particle.position.set(
                        0.02 + Math.cos(angle) * radius,
                        height,
                        0.03 + Math.sin(angle) * radius
                    );
                    
                    particle.scale.set(
                        0.5 + Math.random() * 0.5,
                        0.5 + Math.random() * 0.5,
                        0.5 + Math.random() * 0.5
                    );
                    
                    particles.push(particle);
                    bombGroup.add(particle);
                }
                
                // Add highlight to the bomb (reflective spot)
                const highlightGeometry = new THREE.SphereGeometry(0.05, 8, 8);
                const highlightMaterial = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.1,
                    metalness: 0.9,
                    opacity: 0.7,
                    transparent: true,
                    alphaTest: 0.5
                });
                
                const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
                highlight.position.set(0.15, 0.2, 0.25);
                highlight.scale.set(1, 0.5, 0.5);
                
                // Add orange circle detail on the bomb (as seen in the image)
                const circleGeometry = new THREE.CircleGeometry(0.08, 16);
                const circleMaterial = new THREE.MeshStandardMaterial({
                    color: 0xff6600,
                    roughness: 0.5,
                    metalness: 0.3,
                    side: THREE.DoubleSide,
                    transparent: true,
                    alphaTest: 0.5
                });
                
                const circle = new THREE.Mesh(circleGeometry, circleMaterial);
                circle.position.set(0.2, 0.1, 0.28);
                circle.rotation.y = Math.PI / 2;
                
                // Add a small red accent at the bottom of the bomb
                const accentGeometry = new THREE.CircleGeometry(0.05, 12);
                const accentMaterial = new THREE.MeshStandardMaterial({
                    color: 0xff0000,
                    roughness: 0.5,
                    metalness: 0.3,
                    side: THREE.DoubleSide,
                    transparent: true,
                    alphaTest: 0.5
                });
                
                const accent = new THREE.Mesh(accentGeometry, accentMaterial);
                accent.position.set(0.15, -0.2, 0.28);
                accent.rotation.y = Math.PI / 2;
                
                // Add all parts to the group
                bombGroup.add(body);
                bombGroup.add(cap);
                bombGroup.add(fuse);
                bombGroup.add(flame);
                bombGroup.add(innerFlame);
                bombGroup.add(highlight);
                bombGroup.add(circle);
                bombGroup.add(accent);
                
                // Store references for animation
                this.flame = flame;
                this.innerFlame = innerFlame;
                this.fuse = fuse;
                this.particles = particles;
            }
            
        } catch (error) {
            console.error('Error creating bomb mesh parts:', error);
            // Fallback to simple sphere if complex geometry fails
            const geometry = new THREE.SphereGeometry(0.4, 16, 16);
            const material = new THREE.MeshStandardMaterial({
                color: 0xff0000,
                roughness: 0.7,
                metalness: 0.3,
                side: THREE.FrontSide
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            bombGroup.add(mesh);
        }
        
        return bombGroup;
    }
    
    update(deltaTime) {
        if (this.exploded || this.removed) return;
        
        this.timer -= deltaTime;
        
        // Scale bomb up and down for pulsing effect
        if (this.mesh) {
            const pulseSpeed = Math.max(0.01, 0.03 * (this.timer / 2000)); // Pulse faster as timer decreases
            const scale = 1 + Math.sin(this.timer * pulseSpeed) * 0.1;
            this.mesh.scale.set(scale, scale, scale);
            
            if (this.bombType === 'alt') {
                // Animate digital bomb
                if (this.tip) {
                    // Make tip blink faster as timer decreases
                    const blinkRate = Math.max(0.1, this.timer / 2000);
                    this.tip.material.emissiveIntensity = (Math.sin(this.timer * 0.02 / blinkRate) > 0) ? 0.8 : 0.1;
                }
                
                // Animate displays - countdown effect
                if (this.displays && this.displays.length > 0) {
                    const timeLeft = Math.ceil(this.timer / 500); // 0-4 countdown
                    
                    // Change display color based on time left
                    const displayColor = timeLeft > 2 ? 0x00ff00 : 
                                        timeLeft > 1 ? 0xffff00 : 0xff0000;
                    
                    this.displays.forEach(display => {
                        display.material.color.setHex(displayColor);
                        display.material.emissive.setHex(displayColor);
                        
                        // Blink rapidly when almost exploding
                        if (timeLeft <= 1) {
                            display.material.emissiveIntensity = (Math.sin(this.timer * 0.05) > 0) ? 0.8 : 0.2;
                        }
                    });
                }
            } else {
                // Animate classic bomb
                if (this.flame) {
                    // Make flame flicker
                    const flickerIntensity = 0.7 + Math.random() * 0.3;
                    this.flame.material.emissiveIntensity = flickerIntensity;
                    
                    // Randomly change flame size
                    const flameScale = 0.9 + Math.random() * 0.2;
                    this.flame.scale.set(flameScale, flameScale, flameScale);
                    
                    // Also animate inner flame
                    if (this.innerFlame) {
                        this.innerFlame.material.emissiveIntensity = flickerIntensity + 0.2;
                        this.innerFlame.scale.set(flameScale * 0.9, flameScale * 0.9, flameScale * 0.9);
                    }
                    
                    // Make fuse shorter as timer decreases
                    if (this.fuse) {
                        const fuseScale = Math.max(0.2, this.timer / 2000);
                        this.fuse.scale.y = fuseScale;
                        this.fuse.position.y = 0.5 - (1 - fuseScale) * 0.1;
                        
                        // Update flame position to follow fuse
                        this.flame.position.y = this.fuse.position.y + this.fuse.scale.y * 0.2 + 0.1;
                        if (this.innerFlame) {
                            this.innerFlame.position.y = this.flame.position.y - 0.03;
                        }
                    }
                    
                    // Animate flame particles
                    if (this.particles) {
                        this.particles.forEach(particle => {
                            // Random movement
                            particle.position.x += (Math.random() - 0.5) * 0.01;
                            particle.position.z += (Math.random() - 0.5) * 0.01;
                            particle.position.y += (Math.random() - 0.5) * 0.01 + 0.005; // Tendency to rise
                            
                            // Keep particles near the flame
                            const dx = particle.position.x - this.flame.position.x;
                            const dz = particle.position.z - this.flame.position.z;
                            const distanceFromCenter = Math.sqrt(dx * dx + dz * dz);
                            
                            if (distanceFromCenter > 0.1 || particle.position.y > this.flame.position.y + 0.15) {
                                // Reset particle position if it strays too far
                                const angle = Math.random() * Math.PI * 2;
                                const radius = 0.03 + Math.random() * 0.03;
                                
                                particle.position.set(
                                    this.flame.position.x + Math.cos(angle) * radius,
                                    this.flame.position.y - 0.05 + Math.random() * 0.1,
                                    this.flame.position.z + Math.sin(angle) * radius
                                );
                            }
                            
                            // Random scale
                            const particleScale = 0.5 + Math.random() * 0.5;
                            particle.scale.set(particleScale, particleScale, particleScale);
                        });
                    }
                }
            }
        }
        
        if (this.timer <= 0) {
            this.explode();
        }
    }
    
    explode() {
        if (this.exploded) return;
        
        this.exploded = true;
        
        // Remove bomb from grid
        this.grid.setCellType(this.gridX, this.gridY, 0);
        
        // Create explosion with appropriate type
        const explosionType = this.bombType === 'alt' ? 'alt' : 'default';
        new Explosion(this.grid, this.gridX, this.gridY, this.range, explosionType);
        
        // Play explosion sound
        if (window.soundManager) {
            window.soundManager.play('bombExplode');
        }
        
        // Remove bomb mesh
        if (this.mesh) {
            window.scene.remove(this.mesh);
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) this.mesh.material.dispose();
        }
        
        // Call onExplode callback if set
        if (this.onExplode) {
            this.onExplode();
        }
    }
    
    forceRemove() {
        if (this.removed) return;
        
        this.removed = true;
        
        // Remove from grid
        this.grid.removeEntity(this);
        
        // Remove mesh
        if (this.mesh) {
            window.scene.remove(this.mesh);
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) this.mesh.material.dispose();
        }
    }
}

export default Bomb; 
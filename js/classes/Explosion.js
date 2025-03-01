// Function to safely get THREE from window object
function getThree() {
    if (!window.THREE) {
        console.error('THREE is not defined in window object');
        throw new Error('THREE.js is not loaded. Please refresh the page and try again.');
    }
    return window.THREE;
}

class Explosion {
    constructor(grid, x, y, range, type = 'default') {
        try {
            // Get THREE safely
            const THREE = getThree();
            this.THREE = THREE; // Store for later use in createExplosionPart
            
            this.grid = grid;
            this.gridX = x;
            this.gridY = y;
            this.range = range;
            this.lifetime = 1000; // 1 second
            this.parts = [];
            this.type = type; // Store explosion type
            
            // Create explosion center
            this.createExplosionPart(x, y, 'center');
            
            // Propagate explosion in four directions
            this.propagateExplosion(x, y, 1, 0, range);  // Right
            this.propagateExplosion(x, y, -1, 0, range); // Left
            this.propagateExplosion(x, y, 0, 1, range);  // Down
            this.propagateExplosion(x, y, 0, -1, range); // Up
            
            // Add to grid entities
            grid.addEntity(this);
        } catch (error) {
            console.error('Error creating explosion:', error);
            throw error;
        }
    }
    
    propagateExplosion(x, y, dx, dy, remainingRange) {
        if (remainingRange <= 0) return;
        
        const newX = x + dx;
        const newY = y + dy;
        
        // Check bounds
        if (newX < 0 || newX >= this.grid.width || newY < 0 || newY >= this.grid.height) {
            return;
        }
        
        const cellType = this.grid.grid[newY][newX];
        
        if (cellType === 1) { // Solid wall
            return;
        }
        
        // Create explosion part
        this.createExplosionPart(newX, newY, remainingRange === 1 ? 'end' : 'middle');
        
        if (cellType === 2) { // Breakable block
            // Remove the block
            this.grid.removeBreakableBlock(newX, newY);
            
            // Check for entities at this position
            const entities = this.grid.entities.filter(e => 
                e.gridX === newX && e.gridY === newY
            );
            
            // Handle entities in explosion
            entities.forEach(entity => {
                if (entity.constructor.name === 'Player') {
                    entity.takeDamage();
                } else if (entity.constructor.name === 'Enemy') {
                    entity.die();
                }
            });
            
            // Chance to spawn power-up
            if (Math.random() < 0.3) { // 30% chance
                this.spawnPowerUp(newX, newY);
            }
            
            return; // Stop propagation
        }
        
        // Check for entities at this position
        const entities = this.grid.entities.filter(e => 
            e.gridX === newX && e.gridY === newY
        );
        
        // Handle entities in explosion
        entities.forEach(entity => {
            if (entity.constructor.name === 'Player') {
                entity.takeDamage();
            } else if (entity.constructor.name === 'Enemy') {
                entity.die();
            } else if (entity.constructor.name === 'Bomb') {
                entity.timer = 0; // Trigger chain reaction
            }
        });
        
        // Continue propagation
        if (cellType !== 3) { // Don't propagate through other bombs
            this.propagateExplosion(newX, newY, dx, dy, remainingRange - 1);
        }
    }
    
    createExplosionPart(x, y, partType) {
        try {
            // Get THREE safely
            const THREE = this.THREE || getThree();
            
            // Set explosion in grid
            this.grid.setCellType(x, y, 4); // 4 = explosion
            
            let geometry, material;
            
            if (this.type === 'alt') {
                // Digital/electric explosion
                geometry = new THREE.BoxGeometry(0.8, 0.4, 0.8);
                
                // Create particle system for digital explosion
                const particleCount = 50;
                const particleGeometry = new THREE.BufferGeometry();
                const particlePositions = new Float32Array(particleCount * 3);
                
                for (let i = 0; i < particleCount; i++) {
                    const i3 = i * 3;
                    particlePositions[i3] = (Math.random() - 0.5) * 0.8;
                    particlePositions[i3 + 1] = Math.random() * 0.8;
                    particlePositions[i3 + 2] = (Math.random() - 0.5) * 0.8;
                }
                
                particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
                
                const particleMaterial = new THREE.PointsMaterial({
                    color: 0x00ffff,
                    size: 0.05,
                    transparent: true,
                    opacity: 0.8,
                    emissive: 0x00ffff,
                    emissiveIntensity: 0.8
                });
                
                const particles = new THREE.Points(particleGeometry, particleMaterial);
                
                // Main explosion material
                material = new THREE.MeshStandardMaterial({
                    color: 0x00ffff,
                    transparent: true,
                    opacity: 0.8,
                    emissive: 0x00ffff,
                    emissiveIntensity: 0.8,
                    wireframe: partType === 'center' ? false : true,
                    alphaTest: 0.5,
                    side: THREE.FrontSide
                });
                
                const mesh = new THREE.Mesh(geometry, material);
                const worldPos = this.grid.gridToWorld(x, y);
                mesh.position.set(worldPos.x, 0.2, worldPos.z);
                
                // Create group to hold mesh and particles
                const group = new THREE.Group();
                group.add(mesh);
                group.add(particles);
                
                window.scene.add(group);
                
                // Store for cleanup
                this.parts.push({
                    x: x,
                    y: y,
                    mesh: group,
                    particles: particles,
                    particleGeometry: particleGeometry,
                    particleMaterial: particleMaterial
                });
            } else {
                // Default fire explosion
                geometry = new THREE.BoxGeometry(0.8, 0.4, 0.8);
                
                // Different colors based on part type
                let emissiveColor;
                if (partType === 'center') {
                    emissiveColor = 0xff5500; // Bright orange for center
                } else if (partType === 'end') {
                    emissiveColor = 0xff0000; // Red for end parts
                } else {
                    emissiveColor = 0xffaa00; // Yellow-orange for middle parts
                }
                
                material = new THREE.MeshStandardMaterial({
                    map: window.textures.explosion,
                    transparent: true,
                    opacity: 0.9,
                    emissive: emissiveColor,
                    emissiveIntensity: 0.7,
                    alphaTest: 0.5,
                    side: THREE.FrontSide
                });
                
                const mesh = new THREE.Mesh(geometry, material);
                const worldPos = this.grid.gridToWorld(x, y);
                mesh.position.set(worldPos.x, 0.2, worldPos.z);
                
                window.scene.add(mesh);
                
                // Store for cleanup
                this.parts.push({
                    x: x,
                    y: y,
                    mesh: mesh
                });
            }
        } catch (error) {
            console.error('Error creating explosion part:', error);
        }
    }
    
    spawnPowerUp(x, y) {
        try {
            // Get THREE safely
            const THREE = this.THREE || getThree();
            
            const types = ['bomb', 'range', 'speed'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            const worldPos = this.grid.gridToWorld(x, y);
            const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            const material = new THREE.MeshStandardMaterial({
                map: type === 'bomb' ? window.textures.powerupBomb :
                     type === 'range' ? window.textures.powerupRange :
                     window.textures.powerupSpeed,
                transparent: true,
                opacity: 1.0,
                alphaTest: 0.5,
                side: THREE.FrontSide
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(worldPos.x, 0.25, worldPos.z);
            window.scene.add(mesh);
            
            // Add power-up entity
            const powerUp = {
                gridX: x,
                gridY: y,
                type: type,
                mesh: mesh,
                update: function(deltaTime) {
                    // Floating animation
                    this.mesh.position.y = 0.25 + Math.sin(Date.now() * 0.003) * 0.1;
                    this.mesh.rotation.y += 0.02;
                    
                    // Check for player collision
                    const player = this.grid.entities.find(e => e.constructor.name === 'Player');
                    if (player && player.gridX === this.gridX && player.gridY === this.gridY) {
                        // Apply power-up effect
                        switch(this.type) {
                            case 'bomb':
                                player.bombCount++;
                                break;
                            case 'range':
                                player.bombRange++;
                                break;
                            case 'speed':
                                player.speed *= 1.2;
                                break;
                        }
                        
                        // Update display
                        player.updateLivesDisplay();
                        
                        // Play power-up sound
                        if (window.soundManager) {
                            window.soundManager.play('powerUp');
                        }
                        
                        // Remove power-up
                        window.scene.remove(this.mesh);
                        this.grid.removeEntity(this);
                        
                        // Cleanup
                        if (this.mesh.geometry) this.mesh.geometry.dispose();
                        if (this.mesh.material) this.mesh.material.dispose();
                    }
                }
            };
            
            powerUp.grid = this.grid;
            this.grid.addEntity(powerUp);
        } catch (error) {
            console.error('Error creating power-up:', error);
        }
    }
    
    update(deltaTime) {
        this.lifetime -= deltaTime;
        
        if (this.lifetime <= 0) {
            // Remove explosion parts
            this.parts.forEach(part => {
                // Clear explosion from grid
                if (this.grid.grid[part.y][part.x] === 4) {
                    this.grid.setCellType(part.x, part.y, 0);
                }
                
                // Remove mesh
                window.scene.remove(part.mesh);
                
                // Cleanup
                if (this.type === 'alt' && part.particleGeometry) {
                    part.particleGeometry.dispose();
                    part.particleMaterial.dispose();
                }
                
                if (part.mesh.geometry) {
                    // For group, we need to dispose children
                    if (part.mesh.isGroup) {
                        part.mesh.children.forEach(child => {
                            if (child.geometry) child.geometry.dispose();
                            if (child.material) child.material.dispose();
                        });
                    } else {
                        part.mesh.geometry.dispose();
                        if (part.mesh.material) part.mesh.material.dispose();
                    }
                }
            });
            
            // Remove from grid entities
            this.grid.removeEntity(this);
        } else {
            // Update explosion effects
            this.parts.forEach(part => {
                if (part.mesh) {
                    if (this.type === 'alt') {
                        // Digital explosion effects
                        // Rotate the particles
                        if (part.particles) {
                            part.particles.rotation.y += 0.05;
                            part.particles.rotation.x += 0.03;
                            
                            // Pulse the particles
                            const scale = 1 + Math.sin(this.lifetime * 0.01) * 0.3;
                            part.particles.scale.set(scale, scale, scale);
                            
                            // Update particle opacity
                            if (part.particleMaterial) {
                                part.particleMaterial.opacity = this.lifetime / 1000;
                            }
                        }
                        
                        // Pulse the main mesh
                        if (part.mesh.children && part.mesh.children[0]) {
                            const mainMesh = part.mesh.children[0];
                            mainMesh.scale.set(1, 1 + Math.sin(this.lifetime * 0.02) * 0.5, 1);
                            
                            if (mainMesh.material) {
                                mainMesh.material.opacity = this.lifetime / 1000;
                                // Smooth flicker effect instead of random
                                const flickerBase = 0.8;
                                const flickerAmount = 0.2;
                                const flickerSpeed = 0.01;
                                mainMesh.material.emissiveIntensity = flickerBase + 
                                    (Math.sin(this.lifetime * flickerSpeed) * 0.5 + 0.5) * flickerAmount;
                            }
                        }
                    } else {
                        // Default explosion effects
                        // Pulsing effect
                        const scale = 1 + Math.sin(this.lifetime * 0.01) * 0.2;
                        part.mesh.scale.set(scale, 1, scale);
                        
                        // Fade out
                        if (part.mesh.material) {
                            part.mesh.material.opacity = this.lifetime / 1000;
                            
                            // Smooth pulsing emissive intensity
                            if (part.mesh.material.emissiveIntensity !== undefined) {
                                const pulseBase = 0.5;
                                const pulseAmount = 0.3;
                                const pulseSpeed = 0.008;
                                part.mesh.material.emissiveIntensity = pulseBase + 
                                    (Math.sin(this.lifetime * pulseSpeed) * 0.5 + 0.5) * pulseAmount;
                            }
                        }
                    }
                }
            });
        }
    }
}

export default Explosion; 
// Get THREE from window object
function getThree() {
    if (!window.THREE) {
        console.error('THREE is not defined in window object');
        if (typeof window.updateLoadingProgress === 'function') {
            window.updateLoadingProgress('Error: THREE.js not available');
        }
        throw new Error('THREE.js is not loaded. Please refresh the page and try again.');
    }
    return window.THREE;
}

// Check if textures exist before loading
async function checkTextureExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error(`Error checking if texture exists at ${url}:`, error);
        return false;
    }
}

// Load textures function
async function loadTextures() {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('Creating TextureLoader...');
            
            // Get THREE from window object
            const THREE = getThree();
            
            if (!THREE) {
                console.error('THREE is not defined! window.THREE:', window.THREE);
                updateLoadingProgress('Error: THREE.js not defined');
                reject(new Error('THREE is not defined'));
                return;
            }
            
            const textureLoader = new THREE.TextureLoader();
            console.log('TextureLoader created successfully');
            
            const texturesToLoad = {
                player: 'assets/textures/player.png',
                enemyRed: 'assets/textures/enemy_red.png',
                enemyBlue: 'assets/textures/enemy_blue.png',
                enemyGreen: 'assets/textures/enemy_green.png',
                bomb: 'assets/textures/bomb.png',
                explosion: 'assets/textures/explosion.png',
                wall: 'assets/textures/wall.png',
                crate: 'assets/textures/crate.png',
                barrel: 'assets/textures/barrel.png',
                crystal: 'assets/textures/crystal.png',
                powerupRange: 'assets/textures/powerup_range.png',
                powerupBomb: 'assets/textures/powerup_bomb.png',
                powerupSpeed: 'assets/textures/powerup_speed.png',
                floor: 'assets/textures/floor.png',
                floorSand: 'assets/textures/floor_sand.png',
                floorIce: 'assets/textures/floor_ice.png',
                metal_crate: 'assets/textures/metal_crate.png',
                ice_block: 'assets/textures/ice_block.png'
            };
            
            console.log('Textures to load:', Object.keys(texturesToLoad).length);
            updateLoadingProgress(`Checking ${Object.keys(texturesToLoad).length} texture files...`);
            
            // Check if textures exist before attempting to load them
            console.log('Checking if texture files exist...');
            const textureExistsPromises = [];
            for (const [key, path] of Object.entries(texturesToLoad)) {
                textureExistsPromises.push(
                    checkTextureExists(path).then(exists => {
                        if (!exists) {
                            console.error(`Texture file does not exist: ${path}`);
                        }
                        return { key, path, exists };
                    })
                );
            }
            
            const textureExistsResults = await Promise.all(textureExistsPromises);
            const missingTextures = textureExistsResults.filter(result => !result.exists);
            
            if (missingTextures.length > 0) {
                console.warn(`Missing ${missingTextures.length} texture files:`, missingTextures.map(t => t.path));
                updateLoadingProgress(`Warning: Missing ${missingTextures.length} texture files`);
                // Continue anyway, we'll handle missing textures gracefully
            }
            
            const loadedTextures = {};
            const totalTextures = Object.keys(texturesToLoad).length;
            let loadedCount = 0;
            let errorCount = 0;
            
            // Update progress function
            const updateProgress = () => {
                const percent = Math.round((loadedCount + errorCount) / totalTextures * 100);
                updateLoadingProgress(`Loading textures: ${loadedCount} loaded, ${errorCount} failed (${percent}%)`);
            };
            
            // Create a fallback texture
            function createFallbackTexture(key) {
                console.log(`Creating fallback texture for: ${key}`);
                
                // Create a small canvas
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;
                const ctx = canvas.getContext('2d');
                
                // Fill with a color based on the key
                let color;
                if (key.includes('player')) {
                    color = '#FF0000'; // Red for player
                } else if (key.includes('enemy')) {
                    color = '#0000FF'; // Blue for enemies
                } else if (key.includes('bomb')) {
                    color = '#000000'; // Black for bombs
                } else if (key.includes('explosion')) {
                    color = '#FFA500'; // Orange for explosions
                } else if (key.includes('powerup')) {
                    color = '#00FF00'; // Green for powerups
                } else if (key.includes('wall') || key.includes('crate')) {
                    color = '#8B4513'; // Brown for walls/crates
                } else if (key.includes('floor')) {
                    color = '#CCCCCC'; // Gray for floor
                } else {
                    color = '#FFFF00'; // Yellow for unknown
                }
                
                // Draw a colored square with a border
                ctx.fillStyle = color;
                ctx.fillRect(0, 0, 64, 64);
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 4;
                ctx.strokeRect(4, 4, 56, 56);
                
                // Add text label
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(key, 32, 32);
                
                // Create a texture from the canvas
                const texture = new THREE.CanvasTexture(canvas);
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                
                console.log(`Fallback texture created for: ${key}`);
                return texture;
            }
            
            // Create a function to handle texture loading
            const loadTexture = (key, path) => {
                console.log(`Starting to load texture: ${key} from ${path}`);
                
                // Check if the texture file exists first
                const textureResult = textureExistsResults.find(r => r.key === key);
                if (textureResult && !textureResult.exists) {
                    console.warn(`Texture file does not exist: ${path}, creating fallback`);
                    try {
                        // Create a fallback texture
                        loadedTextures[key] = createFallbackTexture(key);
                        loadedCount++;
                        updateProgress();
                        
                        if (loadedCount + errorCount === totalTextures) {
                            console.warn(`Completed with fallback textures`);
                            updateLoadingProgress(`Completed with fallback textures`);
                            window.textures = loadedTextures;
                            resolve();
                        }
                    } catch (fallbackError) {
                        console.error(`Error creating fallback texture for ${key}:`, fallbackError);
                        errorCount++;
                        updateProgress();
                        
                        if (loadedCount + errorCount === totalTextures) {
                            if (errorCount === totalTextures) {
                                updateLoadingProgress('Failed to load any textures');
                                reject(new Error(`Failed to load any textures`));
                            } else {
                                console.warn(`Completed with ${errorCount} errors, but continuing anyway`);
                                updateLoadingProgress(`Completed with ${errorCount} errors, continuing anyway`);
                                window.textures = loadedTextures;
                                resolve();
                            }
                        }
                    }
                    return;
                }
                
                textureLoader.load(
                    path,
                    (texture) => {
                        console.log(`Texture loaded successfully: ${key}`);
                        try {
                            texture.colorSpace = THREE.SRGBColorSpace;
                            texture.minFilter = THREE.LinearFilter;
                            texture.magFilter = THREE.LinearFilter;
                            loadedTextures[key] = texture;
                            loadedCount++;
                            
                            console.log(`Loaded ${loadedCount}/${totalTextures} textures`);
                            updateProgress();
                            
                            if (loadedCount + errorCount === totalTextures) {
                                if (errorCount > 0) {
                                    console.warn(`Completed with ${errorCount} errors, but continuing anyway`);
                                    updateLoadingProgress(`Completed with ${errorCount} errors, continuing anyway`);
                                }
                                window.textures = loadedTextures;
                                console.log('All textures loaded successfully');
                                updateLoadingProgress('All textures loaded successfully');
                                resolve();
                            }
                        } catch (err) {
                            console.error(`Error processing texture ${key}:`, err);
                            errorCount++;
                            updateProgress();
                            
                            if (loadedCount + errorCount === totalTextures) {
                                if (errorCount === totalTextures) {
                                    updateLoadingProgress('Failed to load any textures');
                                    reject(new Error(`Failed to load any textures`));
                                } else {
                                    console.warn(`Completed with ${errorCount} errors, but continuing anyway`);
                                    updateLoadingProgress(`Completed with ${errorCount} errors, continuing anyway`);
                                    window.textures = loadedTextures;
                                    resolve();
                                }
                            }
                        }
                    },
                    (progressEvent) => {
                        console.log(`Loading progress for ${key}:`, progressEvent);
                    },
                    (error) => {
                        console.error(`Error loading texture ${path}:`, error);
                        errorCount++;
                        updateProgress();
                        
                        if (loadedCount + errorCount === totalTextures) {
                            if (errorCount === totalTextures) {
                                updateLoadingProgress('Failed to load any textures');
                                reject(new Error(`Failed to load any textures`));
                            } else {
                                console.warn(`Completed with ${errorCount} errors, but continuing anyway`);
                                updateLoadingProgress(`Completed with ${errorCount} errors, continuing anyway`);
                                window.textures = loadedTextures;
                                resolve();
                            }
                        }
                    }
                );
            };
            
            // Load each texture
            Object.entries(texturesToLoad).forEach(([key, path]) => {
                loadTexture(key, path);
            });
            
        } catch (error) {
            console.error('Error in loadTextures:', error);
            updateLoadingProgress('Error loading textures: ' + error.message);
            reject(error);
        }
    });
}

// Helper function to update loading progress with a fallback
function updateLoadingProgress(message) {
    console.log(message);
    if (typeof window.updateLoadingProgress === 'function') {
        window.updateLoadingProgress(message);
    }
}

// Show error message
function showError(message) {
    console.error(message);
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Play error sound if not already played
        if (!errorDiv.dataset.soundPlayed && window.soundManager) {
            try {
                window.soundManager.play('gameOver');
                errorDiv.dataset.soundPlayed = 'true';
            } catch (e) {
                console.error('Error playing sound:', e);
            }
        }
    }
}

// Setup lighting
function setupLighting() {
    try {
        // Get THREE from window object
        const THREE = getThree();
        
        if (!THREE) {
            console.error('THREE is not defined in setupLighting!');
            return;
        }
        
        // Verify that essential THREE components are available
        if (!THREE.AmbientLight || !THREE.DirectionalLight) {
            console.error('THREE lighting components are not available:', 
                          'AmbientLight:', !!THREE.AmbientLight, 
                          'DirectionalLight:', !!THREE.DirectionalLight);
            return;
        }
        
        // Verify scene exists
        if (!window.scene) {
            console.error('Scene is not defined in setupLighting!');
            return;
        }
        
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        window.scene.add(ambientLight);
        console.log('Ambient light added');

        // Main directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.target.position.set(0, 0, 0);
        directionalLight.castShadow = true;
        
        // Adjust shadow camera to cover the entire scene
        const d = 15;
        directionalLight.shadow.camera.left = -d;
        directionalLight.shadow.camera.right = d;
        directionalLight.shadow.camera.top = d;
        directionalLight.shadow.camera.bottom = -d;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.bias = -0.001;
        
        window.scene.add(directionalLight);
        window.scene.add(directionalLight.target);
        console.log('Directional light added');

        // Add fill light from the opposite side
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-10, 10, -10);
        window.scene.add(fillLight);
        console.log('Fill light added');
    } catch (error) {
        console.error('Error in setupLighting:', error);
        // Don't throw the error, just log it to prevent game initialization from failing
    }
}

// Handle window resize
function onWindowResize() {
    try {
        if (window.camera && window.renderer) {
            window.camera.aspect = window.innerWidth / window.innerHeight;
            window.camera.updateProjectionMatrix();
            window.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    } catch (error) {
        console.error('Error in onWindowResize:', error);
    }
}

export { loadTextures, showError, setupLighting, onWindowResize }; 
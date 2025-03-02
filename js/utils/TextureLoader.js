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
                // Player textures
                player: 'assets/textures/player.png',
                playerAlt: 'assets/textures/player_alt.png',
                playerGirl: 'assets/textures/player_girl.png',
                
                // Enemy textures
                enemy: 'assets/textures/enemy.png',
                enemyRed: 'assets/textures/enemy_red.png',
                enemyBlue: 'assets/textures/enemy_blue.png',
                enemyGreen: 'assets/textures/enemy_green.png',
                enemyBoss: 'assets/textures/enemy_boss.png',
                
                // Bomb textures
                bomb: 'assets/textures/bomb.png',
                bombAlt: 'assets/textures/bomb_alt.png',
                
                // Explosion textures
                explosion: 'assets/textures/explosion.png',
                explosionBlue: 'assets/textures/explosion_blue.png',
                
                // Wall textures
                wall: 'assets/textures/wall.png',
                wallStone: 'assets/textures/wall_stone.png',
                
                // Breakable block textures
                crate: 'assets/textures/breakable.png',
                metalCrate: 'assets/textures/metal_crate.png',
                iceBlock: 'assets/textures/ice_block.png',
                barrel: 'assets/textures/barrel.png',
                crystal: 'assets/textures/crystal.png',
                
                // Powerup textures
                powerup: 'assets/textures/powerup.png',
                powerupBomb: 'assets/textures/powerup_bomb.png',
                powerupRange: 'assets/textures/powerup_range.png',
                powerupSpeed: 'assets/textures/powerup_speed.png',
                powerupLife: 'assets/textures/powerup_life.png',
                powerupShield: 'assets/textures/powerup_shield.png',
                
                // Floor textures
                floor: 'assets/textures/floor.png',
                floorSand: 'assets/textures/floor_sand.png',
                floorIce: 'assets/textures/floor_ice.png',
                floorLava: 'assets/textures/floor_lava.png'
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
                            
                            // Ensure proper alpha channel handling for textures that need transparency
                            if (key.includes('powerup') || 
                                key.includes('player') || 
                                key.includes('enemy') || 
                                key.includes('bomb')) {
                                texture.premultiplyAlpha = false;
                            }
                            
                            // Special handling for breakable block textures to avoid transparency issues
                            if (key.includes('crate') || key.includes('breakable') || 
                                key.includes('crystal') || key.includes('barrel') || 
                                key.includes('iceBlock') || key.includes('metal')) {
                                texture.premultiplyAlpha = true;
                                texture.alphaTest = 0.5; // Add alpha test to avoid semi-transparent pixels
                            }
                            
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
            
            // Load all textures
            for (const [key, path] of Object.entries(texturesToLoad)) {
                loadTexture(key, path);
            }
        } catch (error) {
            console.error('Error in loadTextures:', error);
            updateLoadingProgress(`Error loading textures: ${error.message}`);
            reject(error);
        }
    });
}

// Function to update loading progress
function updateLoadingProgress(message) {
    if (typeof window.updateLoadingProgress === 'function') {
        window.updateLoadingProgress(message);
    } else {
        console.log('Loading progress:', message);
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
        if (!THREE.AmbientLight || !THREE.DirectionalLight || !THREE.PointLight || !THREE.SpotLight) {
            console.error('THREE lighting components are not available');
            return;
        }
        
        // Verify scene exists
        if (!window.scene) {
            console.error('Scene is not defined in setupLighting!');
            return;
        }
        
        // Remove any existing lights
        const existingLights = window.scene.children.filter(child => 
            child instanceof THREE.AmbientLight || 
            child instanceof THREE.DirectionalLight || 
            child instanceof THREE.PointLight ||
            child instanceof THREE.SpotLight
        );
        
        existingLights.forEach(light => {
            window.scene.remove(light);
        });
        
        // Ambient light - slightly warmer color
        const ambientLight = new THREE.AmbientLight(0xffffeb, 0.4);
        window.scene.add(ambientLight);
        console.log('Ambient light added');

        // Main directional light (sun) - warmer color
        const directionalLight = new THREE.DirectionalLight(0xffffcc, 1.0);
        directionalLight.position.set(15, 25, 15);
        directionalLight.target.position.set(0, 0, 0);
        directionalLight.castShadow = true;
        
        // Improve shadow quality
        const d = 20;
        directionalLight.shadow.camera.left = -d;
        directionalLight.shadow.camera.right = d;
        directionalLight.shadow.camera.top = d;
        directionalLight.shadow.camera.bottom = -d;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.mapSize.width = 4096;
        directionalLight.shadow.mapSize.height = 4096;
        directionalLight.shadow.bias = -0.0005;
        directionalLight.shadow.normalBias = 0.02;
        
        window.scene.add(directionalLight);
        window.scene.add(directionalLight.target);
        console.log('Directional light added');

        // Add fill light from the opposite side - cooler color for contrast
        const fillLight = new THREE.DirectionalLight(0xccddff, 0.4);
        fillLight.position.set(-15, 10, -15);
        window.scene.add(fillLight);
        console.log('Fill light added');
        
        // Add a subtle point light to enhance the center of the scene
        const centerLight = new THREE.PointLight(0xffffdd, 0.6, 20);
        centerLight.position.set(0, 5, 0);
        centerLight.castShadow = true;
        centerLight.shadow.mapSize.width = 1024;
        centerLight.shadow.mapSize.height = 1024;
        centerLight.shadow.bias = -0.0005;
        window.scene.add(centerLight);
        console.log('Center point light added');
        
        // Add subtle colored rim lights for visual interest
        const rimLight1 = new THREE.PointLight(0xffaa44, 0.3, 15);
        rimLight1.position.set(10, 2, -10);
        window.scene.add(rimLight1);
        
        const rimLight2 = new THREE.PointLight(0x44aaff, 0.3, 15);
        rimLight2.position.set(-10, 2, 10);
        window.scene.add(rimLight2);
        console.log('Rim lights added');
        
        // Enable better shadows for the renderer
        if (window.renderer) {
            window.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            window.renderer.physicallyCorrectLights = true;
            window.renderer.outputEncoding = THREE.sRGBEncoding;
            window.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            window.renderer.toneMappingExposure = 1.2;
        }
        
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
            
            // Check if we're on mobile after resize
            const isMobile = window.isMobileDevice && window.isMobileDevice();
            
            // Adjust camera for mobile/desktop view when orientation changes
            if (isMobile) {
                // Only update camera position if it's significantly different
                // to avoid jarring changes during small resizes
                const distanceFromMobilePosition = Math.sqrt(
                    Math.pow(window.camera.position.y - 10, 2) + 
                    Math.pow(window.camera.position.z - 6, 2)
                );
                
                // If camera is far from the ideal mobile position, adjust it
                if (distanceFromMobilePosition > 3) {
                    // Smoothly transition to mobile view
                    const targetY = 10;
                    const targetZ = 6;
                    
                    // Move 20% of the way to the target position
                    window.camera.position.y += (targetY - window.camera.position.y) * 0.2;
                    window.camera.position.z += (targetZ - window.camera.position.z) * 0.2;
                    
                    // Update controls if they exist
                    if (window.controls) {
                        window.controls.minDistance = 3;
                        window.controls.maxDistance = 12;
                        window.controls.maxPolarAngle = Math.PI / 2.5;
                        window.controls.update();
                    }
                }
            } else {
                // For desktop, only adjust if we were previously in mobile view
                const distanceFromDesktopPosition = Math.sqrt(
                    Math.pow(window.camera.position.y - 8, 2) + 
                    Math.pow(window.camera.position.z - 8, 2)
                );
                
                if (distanceFromDesktopPosition > 3) {
                    // Smoothly transition to desktop view
                    const targetY = 8;
                    const targetZ = 8;
                    
                    window.camera.position.y += (targetY - window.camera.position.y) * 0.2;
                    window.camera.position.z += (targetZ - window.camera.position.z) * 0.2;
                    
                    // Update controls if they exist
                    if (window.controls) {
                        window.controls.minDistance = 4;
                        window.controls.maxDistance = 15;
                        window.controls.maxPolarAngle = Math.PI / 2;
                        window.controls.update();
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error in onWindowResize:', error);
    }
}

export { loadTextures, showError, setupLighting, onWindowResize }; 
// Add a script to handle early errors
document.addEventListener('DOMContentLoaded', () => {
    window.handleEarlyError = function(error) {
        console.error('Early initialization error:', error);
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.innerHTML = `Failed to initialize game:<br>${error.message}<br><br>Please check your browser console for details.`;
        }
    };
});

// Import THREE.js and OrbitControls using ES modules
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Log successful imports
console.log('THREE.js imported successfully, version:', THREE.REVISION);
console.log('OrbitControls imported successfully');

// Make THREE globally available
window.THREE = THREE;
window.OrbitControls = OrbitControls;

// Import local modules
import SoundManager from './managers/SoundManager.js';
import InputManager from './managers/InputManager.js';
import GridSystem from './classes/GridSystem.js';
import Player from './classes/Player.js';
import Enemy from './classes/Enemy.js';
import GameLoop from './classes/GameLoop.js';
import { levels, createLevel, nextLevel } from './managers/LevelManager.js';
import { loadTextures, showError, setupLighting, onWindowResize } from './utils/TextureLoader.js';

// Initialize the game immediately
initializeGame();

// Function to initialize the game after THREE.js is loaded
function initializeGame() {
    // Make classes globally accessible
    window.Enemy = Enemy;
    window.nextLevel = nextLevel;
    window.createLevel = createLevel;
    window.showError = showError;
    
    // Call init function
    if (typeof window.updateLoadingProgress === 'function') {
        window.updateLoadingProgress('Game modules loaded, initializing...');
    }
    
    // Export init function to global scope for access from index.html
    window.gameInit = init;
    window.gameReset = resetGame;
    window.gameToggleSound = toggleSound;
}

// Initialize the game
function init() {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('Initializing game...');
            
            // Update loading progress
            if (typeof window.updateLoadingProgress === 'function') {
                window.updateLoadingProgress('Setting up game environment...');
            }
            
            // Check if THREE is available
            if (!window.THREE) {
                throw new Error('THREE.js is not loaded. Please refresh the page and try again.');
            }
            
            console.log('THREE version:', window.THREE.REVISION);
            
            // Create scene
            window.scene = new window.THREE.Scene();
            window.scene.background = new window.THREE.Color(0x87CEEB); // Sky blue background
            console.log('Scene created');
            
            if (typeof window.updateLoadingProgress === 'function') {
                window.updateLoadingProgress('Creating camera and renderer...');
            }
            
            // Create camera
            window.camera = new window.THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            window.camera.position.set(0, 10, 10);
            window.camera.lookAt(0, 0, 0);
            console.log('Camera created');

            // Create renderer
            window.renderer = new window.THREE.WebGLRenderer({ antialias: true });
            window.renderer.setSize(window.innerWidth, window.innerHeight);
            window.renderer.shadowMap.enabled = true;
            document.body.appendChild(window.renderer.domElement);
            console.log('Renderer created');

            if (typeof window.updateLoadingProgress === 'function') {
                window.updateLoadingProgress('Setting up controls...');
            }
            
            // Create orbit controls
            try {
                console.log('Creating OrbitControls...');
                if (!window.OrbitControls) {
                    throw new Error('OrbitControls not loaded');
                }
                window.controls = new window.OrbitControls(window.camera, window.renderer.domElement);
                window.controls.enableDamping = true;
                window.controls.dampingFactor = 0.05;
                window.controls.screenSpacePanning = false;
                window.controls.minDistance = 5;
                window.controls.maxDistance = 20;
                window.controls.maxPolarAngle = Math.PI / 2;
                console.log('Controls created successfully');
            } catch (controlsError) {
                console.error('Error creating controls:', controlsError);
                // Continue without controls if they fail to initialize
            }
            
            if (typeof window.updateLoadingProgress === 'function') {
                window.updateLoadingProgress('Initializing input and sound...');
            }
            
            // Initialize input manager
            window.inputManager = new InputManager();
            console.log('Input manager initialized');
            
            // Initialize sound manager
            try {
                window.soundManager = new SoundManager();
                console.log('Sound manager initialized');
            } catch (soundError) {
                console.error('Error initializing sound manager:', soundError);
                // Create a dummy sound manager to prevent errors
                window.soundManager = {
                    play: () => console.log('Sound disabled'),
                    toggleMute: () => console.log('Sound disabled'),
                    isMuted: true
                };
            }
            
            if (typeof window.updateLoadingProgress === 'function') {
                window.updateLoadingProgress('Setting up lighting...');
            }
            
            // Setup lighting
            try {
                setupLighting();
                console.log('Lighting setup complete');
            } catch (lightingError) {
                console.error('Error setting up lighting:', lightingError);
                // Continue without proper lighting
            }
            
            // Start background music
            try {
                window.soundManager.play('bgMusic');
                console.log('Background music started');
            } catch (audioError) {
                console.warn('Could not play background music:', audioError);
                // Continue without background music
            }
            
            // Set initial game state
            window.currentLevel = 1;
            window.levelTransition = false;
            window.levelTransitionTime = 0;
            window.levelTransitionDuration = 2000; // 2 seconds
            window.textures = {};
            console.log('Game state initialized');
            
            if (typeof window.updateLoadingProgress === 'function') {
                window.updateLoadingProgress('Loading textures...');
            }
            
            // Load textures
            console.log('Starting texture loading...');
            try {
                await loadTextures();
                console.log('Textures loaded successfully');
            } catch (textureError) {
                console.error('Error loading textures:', textureError);
                reject(textureError);
                return;
            }
            
            if (typeof window.updateLoadingProgress === 'function') {
                window.updateLoadingProgress('Creating game level...');
            }
            
            // Get current level data
            const levelData = levels[window.currentLevel - 1];
            console.log('Level data retrieved:', levelData);
            
            // Create grid for current level
            window.grid = new GridSystem(levelData.width, levelData.height, 1);
            console.log('Grid system created');
            
            // Parse level layout
            try {
                createLevel(window.currentLevel);
                console.log('Level created');
            } catch (levelError) {
                console.error('Error creating level:', levelError);
                reject(levelError);
                return;
            }
            
            if (typeof window.updateLoadingProgress === 'function') {
                window.updateLoadingProgress('Creating player...');
            }
            
            // Create player
            try {
                window.player = new Player(window.grid, window.grid.playerStartX || 1, window.grid.playerStartY || 1);
                console.log('Player created');
            } catch (playerError) {
                console.error('Error creating player:', playerError);
                reject(playerError);
                return;
            }
            
            // Add player to grid entities
            window.grid.addEntity(window.player);
            console.log('Player added to grid');
            
            if (typeof window.updateLoadingProgress === 'function') {
                window.updateLoadingProgress('Starting game loop...');
            }
            
            // Create game loop
            window.gameLoop = new GameLoop();
            
            // Final check to ensure all required components are available
            if (typeof window.updateLoadingProgress === 'function') {
                window.updateLoadingProgress('Performing final checks...');
            }
            
            const requiredComponents = [
                { name: 'scene', object: window.scene },
                { name: 'camera', object: window.camera },
                { name: 'renderer', object: window.renderer },
                { name: 'grid', object: window.grid },
                { name: 'player', object: window.player },
                { name: 'textures', object: window.textures, checkEmpty: true }
            ];
            
            const missingComponents = requiredComponents.filter(comp => {
                if (!comp.object) return true;
                if (comp.checkEmpty && Object.keys(comp.object).length === 0) return true;
                return false;
            });
            
            if (missingComponents.length > 0) {
                const missingNames = missingComponents.map(c => c.name).join(', ');
                const error = new Error(`Missing required components: ${missingNames}`);
                console.error(error);
                if (typeof window.updateLoadingProgress === 'function') {
                    window.updateLoadingProgress(`Error: Missing ${missingNames}`);
                }
                reject(error);
                return;
            }
            
            // All checks passed, start the game loop
            window.gameLoop.start();
            console.log('Game loop started');
            
            console.log('Game initialized successfully');
            
            // Handle window resize
            window.addEventListener('resize', onWindowResize);
            
            if (typeof window.updateLoadingProgress === 'function') {
                window.updateLoadingProgress('Game ready!');
            }
            
            // Resolve the promise to indicate successful initialization
            resolve();
            
        } catch (error) {
            console.error('Error initializing game:', error);
            showError('Failed to initialize game: ' + error.message);
            
            // Show more detailed error information
            const loadingElement = document.getElementById('loading');
            if (loadingElement) {
                loadingElement.innerHTML = `Failed to load game:<br>${error.message}<br><br>Check browser console for details.`;
            }
            
            // Reject the promise to indicate failed initialization
            reject(error);
        }
    });
}

// Reset game function
function resetGame() {
    console.log("Reset game function called");
    
    // Stop the game loop
    if (window.gameLoop) {
        window.gameLoop.stop();
        window.gameLoop = null;
    }
    
    // Clear all entities and breakable blocks
    if (window.grid) {
        // Clear entities
        window.grid.entities.length = 0;
        
        // Clear breakable blocks
        for (let key in window.grid.breakableBlocks) {
            const block = window.grid.breakableBlocks[key];
            if (block) {
                window.scene.remove(block);
                if (block.geometry) block.geometry.dispose();
                if (block.material) {
                    if (Array.isArray(block.material)) {
                        block.material.forEach(m => m.dispose());
                    } else {
                        block.material.dispose();
                    }
                }
            }
        }
        window.grid.breakableBlocks = {};
    }
    
    // Clear the scene
    if (window.scene) {
        while(window.scene.children.length > 0) { 
            const object = window.scene.children[0];
            window.scene.remove(object);
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => m.dispose());
                } else {
                    object.material.dispose();
                }
            }
        }
    }
    
    // Reset game state
    window.currentLevel = 1;
    window.player = null;
    window.grid = null;
    
    // Clear any error messages
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
        delete errorDiv.dataset.soundPlayed;
    }
    
    // Clear any level complete or overlay messages
    const levelComplete = document.getElementById('levelComplete');
    if (levelComplete && levelComplete.parentNode) {
        levelComplete.parentNode.removeChild(levelComplete);
    }
    
    const overlay = document.getElementById('fadeOverlay');
    if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
    }
    
    // Reset level transition state
    window.levelTransition = false;
    window.levelTransitionTime = 0;
    
    // Clear all textures
    for (let key in window.textures) {
        if (window.textures[key]) {
            window.textures[key].dispose();
        }
    }
    window.textures = {};
    
    // Clear renderer
    if (window.renderer) {
        window.renderer.dispose();
        if (window.renderer.domElement && window.renderer.domElement.parentNode) {
            window.renderer.domElement.parentNode.removeChild(window.renderer.domElement);
        }
    }
    
    // Clear controls
    if (window.controls) {
        window.controls.dispose();
    }
    
    // Clear camera
    window.camera = null;
    
    // Clear sound manager
    if (window.soundManager) {
        window.soundManager.stopBackgroundMusic();
    }
    
    // Restart the game after a short delay to ensure cleanup is complete
    setTimeout(() => {
        init();
    }, 100);
}

// Toggle sound function
function toggleSound() {
    console.log("Toggle sound function called");
    
    // Access the soundManager from the window object
    if (window.soundManager) {
        window.soundManager.toggleMute();
        
        // Update button text
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.textContent = window.soundManager.isMuted ? 'Sound: OFF' : 'Sound: ON';
        }
    }
}

// Export functions for global access
export { init, resetGame, toggleSound }; 
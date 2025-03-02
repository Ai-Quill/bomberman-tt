class GameLoop {
    constructor() {
        this.lastTime = performance.now();
        this.isRunning = false;
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.loop.bind(this));
            console.log('Game loop started');
        }
    }
    
    stop() {
        this.isRunning = false;
        console.log('Game loop stopped');
    }
    
    loop(currentTime) {
        if (!this.isRunning) return;
        
        // Calculate delta time
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        try {
            // Update game state
            if (window.grid && typeof window.grid.update === 'function') {
                window.grid.update(deltaTime);
            } else if (window.grid) {
                console.warn('Grid exists but update method is missing or not a function');
            } else {
                console.warn('Grid is not defined');
            }
            
            // Update camera controls
            if (window.controls && typeof window.controls.update === 'function') {
                window.controls.update();
            }
            
            // Handle level transition
            if (window.levelTransition) {
                window.levelTransitionTime += deltaTime;
                if (window.levelTransitionTime >= window.levelTransitionDuration) {
                    window.levelTransition = false;
                    window.levelTransitionTime = 0;
                }
            }
            
            // Render scene
            if (window.renderer && window.scene && window.camera) {
                window.renderer.render(window.scene, window.camera);
            } else {
                console.warn('Cannot render: missing renderer, scene, or camera');
            }
            
        } catch (error) {
            console.error('Error in game loop:', error);
            this.stop();
            if (typeof window.showError === 'function') {
                window.showError('Game loop error: ' + error.message);
            } else {
                console.error('showError function not available');
                alert('Game loop error: ' + error.message);
            }
            return;
        }
        
        // Continue loop
        if (this.isRunning) {
            requestAnimationFrame(this.loop.bind(this));
        }
    }
}

export default GameLoop; 
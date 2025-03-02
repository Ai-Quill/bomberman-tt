class InputManager {
    constructor() {
        this.keys = {};
        this.bindings = {
            'up': ['ArrowUp', 'KeyW'],
            'down': ['ArrowDown', 'KeyS'],
            'left': ['ArrowLeft', 'KeyA'],
            'right': ['ArrowRight', 'KeyD'],
            'bomb': ['Space', 'KeyB']
        };
        
        // Virtual buttons state for mobile
        this.virtualButtons = {
            'up': false,
            'down': false,
            'left': false,
            'right': false,
            'bomb': false
        };
        
        // Set up keyboard event listeners
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Set up mobile controls if they exist
        this.setupMobileControls();
    }
    
    setupMobileControls() {
        // Check if we're on mobile by screen size or touch capability
        const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
        
        if (isMobile) {
            console.log('Mobile device detected, setting up touch controls');
            
            // Get mobile control elements
            const dpadUp = document.getElementById('dpad-up');
            const dpadDown = document.getElementById('dpad-down');
            const dpadLeft = document.getElementById('dpad-left');
            const dpadRight = document.getElementById('dpad-right');
            const bombButton = document.getElementById('bomb-button');
            
            // Helper function to add touch events to a button
            const addTouchEvents = (element, action) => {
                if (!element) return;
                
                // Touch start - press button
                element.addEventListener('touchstart', (e) => {
                    e.preventDefault(); // Prevent default touch behavior
                    this.virtualButtons[action] = true;
                    element.classList.add('active');
                });
                
                // Touch end - release button
                element.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.virtualButtons[action] = false;
                    element.classList.remove('active');
                });
                
                // Touch cancel - release button
                element.addEventListener('touchcancel', (e) => {
                    e.preventDefault();
                    this.virtualButtons[action] = false;
                    element.classList.remove('active');
                });
                
                // Also add mouse events for testing on desktop
                element.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    this.virtualButtons[action] = true;
                    element.classList.add('active');
                });
                
                element.addEventListener('mouseup', (e) => {
                    e.preventDefault();
                    this.virtualButtons[action] = false;
                    element.classList.remove('active');
                });
                
                // Handle mouse leaving the button while pressed
                element.addEventListener('mouseleave', (e) => {
                    if (this.virtualButtons[action]) {
                        e.preventDefault();
                        this.virtualButtons[action] = false;
                        element.classList.remove('active');
                    }
                });
            };
            
            // Add touch events to all buttons
            addTouchEvents(dpadUp, 'up');
            addTouchEvents(dpadDown, 'down');
            addTouchEvents(dpadLeft, 'left');
            addTouchEvents(dpadRight, 'right');
            addTouchEvents(bombButton, 'bomb');
            
            // Prevent default touch behavior on the game canvas to avoid scrolling
            const gameCanvas = document.querySelector('canvas');
            if (gameCanvas) {
                gameCanvas.addEventListener('touchstart', (e) => e.preventDefault());
                gameCanvas.addEventListener('touchmove', (e) => e.preventDefault());
                gameCanvas.addEventListener('touchend', (e) => e.preventDefault());
            }
            
            // Add a switch bomb type button for mobile
            const createSwitchBombButton = () => {
                const switchBombButton = document.createElement('div');
                switchBombButton.id = 'switch-bomb-button';
                switchBombButton.textContent = 'SWITCH';
                switchBombButton.style.position = 'absolute';
                switchBombButton.style.bottom = '130px';
                switchBombButton.style.right = '50px';
                switchBombButton.style.width = '70px';
                switchBombButton.style.height = '40px';
                switchBombButton.style.backgroundColor = 'rgba(42, 6, 84, 0.7)';
                switchBombButton.style.border = '2px solid #5996ff';
                switchBombButton.style.borderRadius = '10px';
                switchBombButton.style.color = 'white';
                switchBombButton.style.fontSize = '14px';
                switchBombButton.style.display = 'flex';
                switchBombButton.style.alignItems = 'center';
                switchBombButton.style.justifyContent = 'center';
                switchBombButton.style.userSelect = 'none';
                switchBombButton.style.webkitUserSelect = 'none';
                
                const mobileControls = document.getElementById('mobileControls');
                if (mobileControls) {
                    mobileControls.appendChild(switchBombButton);
                    
                    // Add event listener for switch bomb button
                    switchBombButton.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        if (window.player && typeof window.player.switchBombType === 'function') {
                            window.player.switchBombType();
                        }
                        switchBombButton.classList.add('active');
                    });
                    
                    switchBombButton.addEventListener('touchend', (e) => {
                        e.preventDefault();
                        switchBombButton.classList.remove('active');
                    });
                    
                    // Also add mouse events for testing
                    switchBombButton.addEventListener('mousedown', (e) => {
                        e.preventDefault();
                        if (window.player && typeof window.player.switchBombType === 'function') {
                            window.player.switchBombType();
                        }
                        switchBombButton.classList.add('active');
                    });
                    
                    switchBombButton.addEventListener('mouseup', (e) => {
                        e.preventDefault();
                        switchBombButton.classList.remove('active');
                    });
                }
            };
            
            // Create the switch bomb button after a short delay to ensure DOM is ready
            setTimeout(createSwitchBombButton, 1000);
        }
    }
    
    handleKeyDown(event) {
        this.keys[event.code] = true;
        
        // Handle bomb type switching with 'B' key
        if (event.code === 'KeyB' && window.player && typeof window.player.switchBombType === 'function') {
            window.player.switchBombType();
        }
    }
    
    handleKeyUp(event) {
        this.keys[event.code] = false;
    }
    
    isActionPressed(action) {
        // Check both keyboard and virtual buttons
        return this.bindings[action].some(key => this.keys[key]) || this.virtualButtons[action];
    }
}

export default InputManager; 
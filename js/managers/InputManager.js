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
        
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }
    
    handleKeyDown(event) {
        this.keys[event.code] = true;
    }
    
    handleKeyUp(event) {
        this.keys[event.code] = false;
    }
    
    isActionPressed(action) {
        return this.bindings[action].some(key => this.keys[key]);
    }
}

export default InputManager; 
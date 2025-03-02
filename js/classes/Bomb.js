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
    constructor(grid, x, y, range) {
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
        if (!THREE || !THREE.SphereGeometry || !THREE.Mesh) {
            console.error('Required THREE components are missing:', 
                         'THREE:', !!THREE,
                         'SphereGeometry:', THREE && !!THREE.SphereGeometry,
                         'Mesh:', THREE && !!THREE.Mesh);
            throw new Error('THREE.js components required for Bomb mesh are not available');
        }
        
        const geometry = new THREE.SphereGeometry(0.4, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            map: window.textures.bomb,
            roughness: 0.7,
            metalness: 0.3
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        return mesh;
    }
    
    update(deltaTime) {
        if (this.exploded || this.removed) return;
        
        this.timer -= deltaTime;
        
        // Scale bomb up and down for pulsing effect
        if (this.mesh) {
            const scale = 1 + Math.sin(this.timer * 0.01) * 0.1;
            this.mesh.scale.set(scale, scale, scale);
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
        
        // Create explosion
        new Explosion(this.grid, this.gridX, this.gridY, this.range);
        
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
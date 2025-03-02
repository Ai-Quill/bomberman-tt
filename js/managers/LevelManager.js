// Function to safely get THREE from window object
function getThree() {
    if (!window.THREE) {
        console.error('THREE is not defined in window object');
        throw new Error('THREE.js is not loaded. Please refresh the page and try again.');
    }
    return window.THREE;
}

// Define game levels
const levels = [
    // Level 1 - Basic level with mixed block types
    {
        width: 15,
        height: 13,
        layout: [
            "###############",
            "#P....*....*..#",
            "#.#.#.#.#.#.#.#",
            "#.............#",
            "#.#.#.#.#.#.#.#",
            "#.............#",
            "#.#.#.#.#.#.#.#",
            "#.............#",
            "#.#.#.#.#.#.#.#",
            "#.............#",
            "#.#.#.#.#.#.#.#",
            "#...*.....*...#",
            "###############"
        ],
        enemyCount: 3,
        theme: 'mixed',
        floorPattern: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ],
        blockTypes: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
    },
    // Level 2 - More enemies and obstacles
    {
        width: 15,
        height: 13,
        layout: [
            "###############",
            "#P...*........#",
            "#.#.#.#.#.#.#.#",
            "#.............#",
            "#.#.#*#.#*#.#.#",
            "#.............#",
            "#.#.#.#.#.#.#.#",
            "#.............#",
            "#.#*#.#.#.#*#.#",
            "#.............#",
            "#.#.#.#.#.#.#.#",
            "#.......*....*#",
            "###############"
        ],
        enemyCount: 5,
        theme: 'mixed',
        floorPattern: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
            [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
            [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        blockTypes: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
    },
    // Level 3 - Complex layout
    {
        width: 17,
        height: 15,
        layout: [
            "#################",
            "#P.............E#",
            "#.#.#.#.#.#.#.#.#",
            "#..............*#",
            "#.#.#.#.#.#.#.#.#",
            "#*....*....*....#",
            "#.#.#.#.#.#.#.#.#",
            "#..............*#",
            "#.#.#.#.#.#.#.#.#",
            "#*....*....*....#",
            "#.#.#.#.#.#.#.#.#",
            "#..............*#",
            "#.#.#.#.#.#.#.#.#",
            "#E.............E#",
            "#################"
        ],
        enemyCount: 7,
        theme: 'mixed',
        floorPattern: [
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
        ],
        blockTypes: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
    },
    // Level 4 - Lava level
    {
        width: 17,
        height: 15,
        layout: [
            "#################",
            "#P.............E#",
            "#.#.#.#.#.#.#.#.#",
            "#..............*#",
            "#.#.#.#.#.#.#.#.#",
            "#*....*....*....#",
            "#.#.#.#.#.#.#.#.#",
            "#..............*#",
            "#.#.#.#.#.#.#.#.#",
            "#*....*....*....#",
            "#.#.#.#.#.#.#.#.#",
            "#..............*#",
            "#.#.#.#.#.#.#.#.#",
            "#E.............E#",
            "#################"
        ],
        enemyCount: 9,
        theme: 'mixed',
        floorPattern: [
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
        ],
        blockTypes: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
    }
];

// Parse level layout and create grid
function parseLevelLayout(grid, levelData) {
    try {
        // Get THREE safely
        const THREE = getThree();
        
        const layout = levelData.layout;
        const theme = levelData.theme || 'grass';
        const floorPattern = levelData.floorPattern || null;
        const blockTypes = levelData.blockTypes || null;
        
        // Player start position
        grid.playerStartX = 1;
        grid.playerStartY = 1;
        
        // Create floor segments instead of a single floor
        if (theme === 'mixed' && floorPattern) {
            // Create floor segments with different textures
            const floorTextures = [
                window.textures.floor,      // 0: grass
                window.textures.floorSand,  // 1: sand
                window.textures.floorIce,   // 2: ice
                window.textures.floorLava   // 3: lava
            ];
            
            // Set up texture properties
            floorTextures.forEach(texture => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);
            });
            
            // Create floor segments
            for (let y = 0; y < floorPattern.length; y++) {
                for (let x = 0; x < floorPattern[y].length; x++) {
                    const floorType = floorPattern[y][x];
                    const floorTexture = floorTextures[floorType];
                    
                    // Create floor segment group for more detailed floors
                    const floorGroup = new THREE.Group();
                    
                    // Position the floor group
                    const worldPos = grid.gridToWorld(x, y);
                    floorGroup.position.set(worldPos.x, 0, worldPos.z);
                    
                    // Create base floor segment
                    const segmentGeometry = new THREE.PlaneGeometry(grid.cellSize, grid.cellSize);
                    
                    // Adjust material properties based on floor type
                    let floorMaterial;
                    
                    switch (floorType) {
                        case 0: // Grass
                            floorMaterial = new THREE.MeshStandardMaterial({
                                map: floorTexture,
                                roughness: 0.9,
                                metalness: 0.1,
                                side: THREE.FrontSide
                            });
                            
                            // Add grass blades for more detail
                            if (Math.random() < 0.3) { // Only add to some tiles for performance
                                const grassCount = 5 + Math.floor(Math.random() * 5);
                                for (let i = 0; i < grassCount; i++) {
                                    const bladeHeight = 0.05 + Math.random() * 0.1;
                                    const bladeWidth = 0.02 + Math.random() * 0.02;
                                    const bladeGeometry = new THREE.PlaneGeometry(bladeWidth, bladeHeight);
                                    const bladeMaterial = new THREE.MeshStandardMaterial({
                                        color: 0x88cc44,
                                        roughness: 0.8,
                                        metalness: 0.1,
                                        side: THREE.DoubleSide,
                                        transparent: true,
                                        alphaTest: 0.5
                                    });
                                    
                                    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
                                    
                                    // Position randomly on the tile
                                    blade.position.set(
                                        (Math.random() - 0.5) * grid.cellSize * 0.8,
                                        bladeHeight / 2,
                                        (Math.random() - 0.5) * grid.cellSize * 0.8
                                    );
                                    
                                    // Rotate randomly
                                    blade.rotation.y = Math.random() * Math.PI;
                                    blade.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.2;
                                    
                                    floorGroup.add(blade);
                                }
                            }
                            break;
                            
                        case 1: // Sand
                            floorMaterial = new THREE.MeshStandardMaterial({
                                map: floorTexture,
                                color: 0xf0e68c, // Khaki color to enhance sand appearance
                                roughness: 0.9,
                                metalness: 0.1,
                                side: THREE.FrontSide
                            });
                            
                            // Add small rocks for more detail
                            if (Math.random() < 0.3) {
                                const rockCount = 2 + Math.floor(Math.random() * 3);
                                for (let i = 0; i < rockCount; i++) {
                                    const rockSize = 0.03 + Math.random() * 0.05;
                                    const rockGeometry = new THREE.DodecahedronGeometry(rockSize, 0);
                                    const rockMaterial = new THREE.MeshStandardMaterial({
                                        color: 0xaaaaaa,
                                        roughness: 0.8,
                                        metalness: 0.2
                                    });
                                    
                                    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
                                    
                                    // Position randomly on the tile
                                    rock.position.set(
                                        (Math.random() - 0.5) * grid.cellSize * 0.7,
                                        rockSize / 2,
                                        (Math.random() - 0.5) * grid.cellSize * 0.7
                                    );
                                    
                                    // Random rotation
                                    rock.rotation.set(
                                        Math.random() * Math.PI,
                                        Math.random() * Math.PI,
                                        Math.random() * Math.PI
                                    );
                                    
                                    rock.castShadow = true;
                                    rock.receiveShadow = true;
                                    floorGroup.add(rock);
                                }
                            }
                            break;
                            
                        case 2: // Ice
                            floorMaterial = new THREE.MeshStandardMaterial({
                                map: floorTexture,
                                color: 0xaaddff,
                                roughness: 0.1,
                                metalness: 0.3,
                                transparent: true,
                                opacity: 0.8,
                                side: THREE.FrontSide
                            });
                            
                            // Add ice cracks for more detail
                            if (Math.random() < 0.4) {
                                const crackCount = 1 + Math.floor(Math.random() * 2);
                                for (let i = 0; i < crackCount; i++) {
                                    const crackLength = 0.3 + Math.random() * 0.4;
                                    const crackWidth = 0.01 + Math.random() * 0.01;
                                    const crackGeometry = new THREE.PlaneGeometry(crackWidth, crackLength);
                                    const crackMaterial = new THREE.MeshStandardMaterial({
                                        color: 0xffffff,
                                        roughness: 0.1,
                                        metalness: 0.5,
                                        transparent: true,
                                        opacity: 0.7,
                                        side: THREE.DoubleSide
                                    });
                                    
                                    const crack = new THREE.Mesh(crackGeometry, crackMaterial);
                                    
                                    // Position randomly on the tile
                                    crack.position.set(
                                        (Math.random() - 0.5) * grid.cellSize * 0.6,
                                        0.001, // Just above the surface
                                        (Math.random() - 0.5) * grid.cellSize * 0.6
                                    );
                                    
                                    // Rotate randomly on the horizontal plane
                                    crack.rotation.x = -Math.PI / 2;
                                    crack.rotation.z = Math.random() * Math.PI;
                                    
                                    floorGroup.add(crack);
                                }
                            }
                            break;
                            
                        case 3: // Lava
                            floorMaterial = new THREE.MeshStandardMaterial({
                                map: floorTexture,
                                color: 0xff3300,
                                roughness: 0.7,
                                metalness: 0.5,
                                emissive: 0xff3300,
                                emissiveIntensity: 0.5,
                                side: THREE.FrontSide
                            });
                            
                            // Add lava bubbles for more detail
                            const bubbleCount = 2 + Math.floor(Math.random() * 3);
                            for (let i = 0; i < bubbleCount; i++) {
                                const bubbleSize = 0.03 + Math.random() * 0.05;
                                const bubbleGeometry = new THREE.SphereGeometry(bubbleSize, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
                                const bubbleMaterial = new THREE.MeshStandardMaterial({
                                    color: 0xff9900,
                                    emissive: 0xff6600,
                                    emissiveIntensity: 0.8,
                                    roughness: 0.3,
                                    metalness: 0.7,
                                    side: THREE.FrontSide
                                });
                                
                                const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
                                
                                // Position randomly on the tile
                                bubble.position.set(
                                    (Math.random() - 0.5) * grid.cellSize * 0.7,
                                    0.001, // Just above the surface
                                    (Math.random() - 0.5) * grid.cellSize * 0.7
                                );
                                
                                bubble.castShadow = true;
                                bubble.receiveShadow = true;
                                
                                // Store initial position for animation
                                bubble.userData = {
                                    initialY: bubble.position.y,
                                    animationOffset: Math.random() * Math.PI * 2,
                                    animationSpeed: 0.001 + Math.random() * 0.002
                                };
                                
                                floorGroup.add(bubble);
                                
                                // Add bubble animation
                                const animateBubble = () => {
                                    if (bubble && bubble.parent) {
                                        const time = Date.now() * bubble.userData.animationSpeed;
                                        bubble.position.y = bubble.userData.initialY + Math.sin(time + bubble.userData.animationOffset) * 0.02;
                                        
                                        // Randomly pop bubbles and create new ones
                                        if (Math.random() < 0.0005) {
                                            window.scene.remove(bubble);
                                            
                                            // Create a new bubble after a delay
                                            setTimeout(() => {
                                                const newBubble = bubble.clone();
                                                newBubble.position.set(
                                                    (Math.random() - 0.5) * grid.cellSize * 0.7,
                                                    0.001,
                                                    (Math.random() - 0.5) * grid.cellSize * 0.7
                                                );
                                                newBubble.userData = {
                                                    initialY: newBubble.position.y,
                                                    animationOffset: Math.random() * Math.PI * 2,
                                                    animationSpeed: 0.001 + Math.random() * 0.002
                                                };
                                                window.scene.add(newBubble);
                                            }, 1000 + Math.random() * 2000);
                                        }
                                        
                                        requestAnimationFrame(animateBubble);
                                    }
                                };
                                
                                animateBubble();
                            }
                            break;
                            
                        default:
                            floorMaterial = new THREE.MeshStandardMaterial({
                                map: floorTexture,
                                roughness: 0.8,
                                metalness: 0.2,
                                side: THREE.FrontSide
                            });
                            break;
                    }
                    
                    const floorSegment = new THREE.Mesh(segmentGeometry, floorMaterial);
                    floorSegment.rotation.x = -Math.PI / 2;
                    floorSegment.receiveShadow = true;
                    floorGroup.add(floorSegment);
                    
                    window.scene.add(floorGroup);
                }
            }
        } else {
            // Create a single floor with one texture (original behavior)
        const floorGeometry = new THREE.PlaneGeometry(grid.width * grid.cellSize, grid.height * grid.cellSize);
        
        // Select floor texture based on theme
        let floorTexture;
        switch (theme) {
            case 'sand':
                floorTexture = window.textures.floorSand;
                break;
            case 'ice':
                floorTexture = window.textures.floorIce;
                break;
            case 'lava':
                floorTexture = window.textures.floorLava;
                break;
            default:
                floorTexture = window.textures.floor;
                break;
        }
        
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(grid.width, grid.height);
        
        // Adjust material properties based on theme
        const floorMaterial = new THREE.MeshStandardMaterial({
            map: floorTexture,
                roughness: theme === 'ice' ? 0.1 : 0.8,
            metalness: theme === 'lava' ? 0.5 : 0.2,
                transparent: theme === 'ice' ? true : false,
                opacity: theme === 'ice' ? 0.8 : 1.0,
                side: THREE.FrontSide
        });
        
        // Add emissive properties for lava
        if (theme === 'lava') {
            floorMaterial.emissive = new THREE.Color(0xff3300);
                floorMaterial.emissiveIntensity = 0.5;
                floorMaterial.color = new THREE.Color(0xff3300);
            }
            
            // Add color tint for ice
            if (theme === 'ice') {
                floorMaterial.color = new THREE.Color(0xaaddff);
            }
            
            // Add color tint for sand
            if (theme === 'sand') {
                floorMaterial.color = new THREE.Color(0xf0e68c);
        }
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(0, 0, 0);
        floor.receiveShadow = true;
        window.scene.add(floor);
            
            // Add theme-specific details
            if (theme === 'lava') {
                // Add lava bubbles
                const bubbleCount = 20;
                for (let i = 0; i < bubbleCount; i++) {
                    const bubbleSize = 0.05 + Math.random() * 0.1;
                    const bubbleGeometry = new THREE.SphereGeometry(bubbleSize, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
                    const bubbleMaterial = new THREE.MeshStandardMaterial({
                        color: 0xff9900,
                        emissive: 0xff6600,
                        emissiveIntensity: 0.8,
                        roughness: 0.3,
                        metalness: 0.7,
                        side: THREE.FrontSide
                    });
                    
                    const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
                    
                    // Position randomly on the floor
                    bubble.position.set(
                        (Math.random() - 0.5) * grid.width * grid.cellSize * 0.9,
                        0.001, // Just above the surface
                        (Math.random() - 0.5) * grid.height * grid.cellSize * 0.9
                    );
                    
                    bubble.rotation.x = -Math.PI / 2;
                    bubble.castShadow = true;
                    bubble.receiveShadow = true;
                    
                    // Store initial position for animation
                    bubble.userData = {
                        initialY: bubble.position.y,
                        animationOffset: Math.random() * Math.PI * 2,
                        animationSpeed: 0.001 + Math.random() * 0.002
                    };
                    
                    window.scene.add(bubble);
                    
                    // Add bubble animation
                    const animateBubble = () => {
                        if (bubble && bubble.parent) {
                            const time = Date.now() * bubble.userData.animationSpeed;
                            bubble.position.y = bubble.userData.initialY + Math.sin(time + bubble.userData.animationOffset) * 0.02;
                            
                            // Randomly pop bubbles and create new ones
                            if (Math.random() < 0.0005) {
                                window.scene.remove(bubble);
                                
                                // Create a new bubble after a delay
                                setTimeout(() => {
                                    const newBubble = bubble.clone();
                                    newBubble.position.set(
                                        (Math.random() - 0.5) * grid.width * grid.cellSize * 0.9,
                                        0.001,
                                        (Math.random() - 0.5) * grid.height * grid.cellSize * 0.9
                                    );
                                    newBubble.userData = {
                                        initialY: newBubble.position.y,
                                        animationOffset: Math.random() * Math.PI * 2,
                                        animationSpeed: 0.001 + Math.random() * 0.002
                                    };
                                    window.scene.add(newBubble);
                                }, 1000 + Math.random() * 2000);
                            }
                            
                            requestAnimationFrame(animateBubble);
                        }
                    };
                    
                    animateBubble();
                }
            } else if (theme === 'ice') {
                // Add ice cracks
                const crackCount = 15;
                for (let i = 0; i < crackCount; i++) {
                    const crackLength = 0.5 + Math.random() * 1.5;
                    const crackWidth = 0.02 + Math.random() * 0.03;
                    const crackGeometry = new THREE.PlaneGeometry(crackWidth, crackLength);
                    const crackMaterial = new THREE.MeshStandardMaterial({
                        color: 0xffffff,
                        roughness: 0.1,
                        metalness: 0.5,
                        transparent: true,
                        opacity: 0.7,
                        side: THREE.DoubleSide
                    });
                    
                    const crack = new THREE.Mesh(crackGeometry, crackMaterial);
                    
                    // Position randomly on the floor
                    crack.position.set(
                        (Math.random() - 0.5) * grid.width * grid.cellSize * 0.9,
                        0.002, // Just above the surface
                        (Math.random() - 0.5) * grid.height * grid.cellSize * 0.9
                    );
                    
                    // Rotate randomly on the horizontal plane
                    crack.rotation.x = -Math.PI / 2;
                    crack.rotation.z = Math.random() * Math.PI;
                    
                    window.scene.add(crack);
                }
            } else if (theme === 'grass') {
                // Add grass blades
                const grassCount = 50;
                for (let i = 0; i < grassCount; i++) {
                    const bladeHeight = 0.1 + Math.random() * 0.2;
                    const bladeWidth = 0.03 + Math.random() * 0.03;
                    const bladeGeometry = new THREE.PlaneGeometry(bladeWidth, bladeHeight);
                    const bladeMaterial = new THREE.MeshStandardMaterial({
                        color: 0x88cc44,
                        roughness: 0.8,
                        metalness: 0.1,
                        side: THREE.DoubleSide,
                        transparent: true,
                        alphaTest: 0.5
                    });
                    
                    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
                    
                    // Position randomly on the floor
                    blade.position.set(
                        (Math.random() - 0.5) * grid.width * grid.cellSize * 0.9,
                        bladeHeight / 2,
                        (Math.random() - 0.5) * grid.height * grid.cellSize * 0.9
                    );
                    
                    // Rotate randomly
                    blade.rotation.y = Math.random() * Math.PI;
                    blade.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.3;
                    
                    window.scene.add(blade);
                }
            }
        }
        
        // Store breakable blocks for reference
        grid.breakableBlocks = {};
        
        // Parse layout
        for (let y = 0; y < layout.length; y++) {
            const row = layout[y];
            for (let x = 0; x < row.length; x++) {
                const cell = row.charAt(x);
                const worldPos = grid.gridToWorld(x, y);
                
                switch (cell) {
                    case '#': // Wall
                        grid.setCellType(x, y, 1);
                        const wallGeometry = new THREE.BoxGeometry(grid.cellSize, grid.cellSize, grid.cellSize);
                        
                        // Use different wall textures based on position (outer vs inner)
                        let wallTexture;
                        let wallRoughness = 0.7;
                        let wallMetalness = 0.3;
                        let wallColor = 0xffffff;
                        
                        // Check if this is an outer wall (border of the level)
                        const isOuterWall = x === 0 || y === 0 || x === row.length - 1 || y === layout.length - 1;
                        
                        if (isOuterWall) {
                            // Outer walls use stone/rock texture
                            wallTexture = window.textures.wallStone;
                            wallRoughness = 0.9;
                            wallMetalness = 0.2;
                            wallColor = 0xb0a0aa; // Even lighter stone color (was 0x8a7a85)
                        } else {
                            // Inner walls use brick texture
                            wallTexture = window.textures.wall;
                            wallRoughness = 0.8;
                            wallMetalness = 0.1;
                            wallColor = 0xb82a3a; // Lighter brick color (was 0x7a0216)
                        }
                        
                        // If we're in a mixed theme, still consider the floor type for special cases
                        if (theme === 'mixed' && floorPattern) {
                            // Get the floor type at this position
                            const floorType = floorPattern[y] && floorPattern[y][x] ? floorPattern[y][x] : 0;
                            
                            // For special floor types, adjust the wall appearance
                            if (floorType === 2) { // Ice
                                wallTexture = window.textures.crystal;
                                wallRoughness = 0.3;
                                wallMetalness = 0.7;
                                wallColor = 0x5996ff; // Blue from palette
                            } else if (floorType === 3) { // Lava
                                // Even for lava, keep the outer/inner distinction
                                if (isOuterWall) {
                                    wallTexture = window.textures.wallStone;
                                    wallColor = 0x6a4694; // Lighter purple for lava areas (was 0x4a2674)
                                } else {
                                    wallTexture = window.textures.wall;
                                    wallColor = 0xea2020; // Red from palette
                                }
                            }
                        }
                        
                        const wallMaterial = new THREE.MeshStandardMaterial({
                            map: wallTexture,
                            color: wallColor,
                            roughness: wallRoughness,
                            metalness: wallMetalness,
                            transparent: false,
                            side: THREE.FrontSide
                        });
                        
                        // Add emissive for lava areas
                        if (theme === 'mixed' && floorPattern && floorPattern[y] && floorPattern[y][x] === 3) {
                            wallMaterial.emissive = new THREE.Color(0xff5500);
                            wallMaterial.emissiveIntensity = 0.2;
                        } else if (theme === 'lava') {
                            wallMaterial.emissive = new THREE.Color(0xff5500);
                            wallMaterial.emissiveIntensity = 0.2;
                        }
                        
                        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                        wall.position.set(worldPos.x, worldPos.y + grid.cellSize * 0.5, worldPos.z);
                        wall.castShadow = true;
                        wall.receiveShadow = true;
                        window.scene.add(wall);
                        break;
                        
                    case '*': // Breakable block
                        grid.setCellType(x, y, 2);
                        // Reduce height by 30% to make blocks shorter and easier to see over
                        const blockGeometry = new THREE.BoxGeometry(
                            grid.cellSize * 0.9, 
                            grid.cellSize * 0.6, // Reduced height (was 0.9)
                            grid.cellSize * 0.9
                        );
                        
                        // Determine block type based on position in blockTypes array
                        let blockType = 0;
                        if (theme === 'mixed' && blockTypes && blockTypes[y] && blockTypes[y][x] !== undefined) {
                            blockType = blockTypes[y][x];
                        }
                        
                        // Select texture based on block type
                        let blockTexture, blockEmissive = 0x000000, blockEmissiveIntensity = 0;
                        
                        switch (blockType) {
                            case 1: // Yellow crate
                                blockTexture = window.textures.crate;
                                break;
                            case 2: // Green barrel
                                blockTexture = window.textures.barrel;
                                break;
                            case 3: // Blue crystal
                                blockTexture = window.textures.crystal;
                                blockEmissive = 0x3a7280;
                                blockEmissiveIntensity = 0.3;
                                break;
                            default: // Default crate
                                blockTexture = window.textures.crate;
                                break;
                        }
                        
                        // If we're in a mixed theme, also consider the floor type
                        if (theme === 'mixed' && floorPattern) {
                            const floorType = floorPattern[y] && floorPattern[y][x] ? floorPattern[y][x] : 0;
                            
                            // Adjust block appearance based on floor type
                            if (floorType === 3) { // Lava
                                blockEmissive = 0xff3300;
                                blockEmissiveIntensity = 0.3;
                            } else if (floorType === 2) { // Ice
                                blockTexture = window.textures.iceBlock;
                            }
                        }
                        
                        // Ensure texture is properly configured for solid appearance
                        if (blockTexture) {
                            // Use ClampToEdgeWrapping to prevent texture from repeating on the faces
                            blockTexture.wrapS = THREE.ClampToEdgeWrapping;
                            blockTexture.wrapT = THREE.ClampToEdgeWrapping;
                            blockTexture.repeat.set(1, 1);
                            blockTexture.needsUpdate = true;
                        }
                        
                        // Create materials for each face of the cube with proper texture mapping
                        const materials = [];
                        
                        // Define the faces in this order: right, left, top, bottom, front, back
                        const faceNames = ['right', 'left', 'top', 'bottom', 'front', 'back'];
                        
                        for (let i = 0; i < 6; i++) {
                            // Clone the texture for each face to avoid shared modifications
                            const faceTexture = blockTexture.clone();
                            faceTexture.wrapS = THREE.ClampToEdgeWrapping;
                            faceTexture.wrapT = THREE.ClampToEdgeWrapping;
                            faceTexture.repeat.set(1, 1);
                            
                            // For the top face, we might want to use a different texture or adjust the current one
                            if (i === 2) { // Top face
                                // You could load a different texture here if available
                                // For now, we'll just ensure it's properly mapped
                                faceTexture.rotation = 0;
                                faceTexture.center.set(0.5, 0.5);
                            }
                            
                            const material = new THREE.MeshStandardMaterial({
                                map: faceTexture,
                                color: 0xffffff,
                                roughness: 0.7,
                                metalness: 0.3,
                                emissive: blockEmissive,
                                emissiveIntensity: blockEmissiveIntensity,
                                transparent: false,
                                alphaTest: 0.5,
                                side: THREE.FrontSide
                            });
                            
                            materials.push(material);
                        }
                        
                        // Add some visual interest with edges
                        const edgesGeometry = new THREE.EdgesGeometry(blockGeometry);
                        const edgesMaterial = new THREE.LineBasicMaterial({ 
                            color: 0x000000,
                            linewidth: 2 // Thicker lines for better visibility
                        });
                        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
                        
                        const block = new THREE.Mesh(blockGeometry, materials);
                        // Position the block with the lower height taken into account
                        block.position.set(worldPos.x, worldPos.y + grid.cellSize * 0.3, worldPos.z);
                        block.castShadow = true;
                        block.receiveShadow = true;
                        block.add(edges); // Add edges to the block
                        window.scene.add(block);
                        
                        // Store reference to breakable block
                        grid.breakableBlocks[`${x},${y}`] = block;
                        break;
                        
                    case 'P': // Player start
                        grid.playerStartX = x;
                        grid.playerStartY = y;
                        break;
                        
                    case 'E': // Enemy
                        // Enemy will be created in the createLevel function
                        break;
                        
                    default:
                        grid.setCellType(x, y, 0);
                        break;
                }
            }
        }
    } catch (error) {
        console.error('Error parsing level layout:', error);
    }
}

// Function to generate random breakable blocks for a level
function generateRandomBreakableBlocks(levelData) {
    const width = levelData.width;
    const height = levelData.height;
    
    // Create a temporary layout array from the original layout
    const tempLayout = [...levelData.layout];
    
    // Clear existing breakable blocks (marked with '*')
    for (let y = 0; y < tempLayout.length; y++) {
        let row = tempLayout[y];
        let newRow = '';
        for (let x = 0; x < row.length; x++) {
            if (row[x] === '*') {
                newRow += '.'; // Replace with empty space
            } else {
                newRow += row[x];
            }
        }
        tempLayout[y] = newRow;
    }
    
    // Calculate how many breakable blocks to add based on level
    const levelNumber = window.currentLevel || 1;
    // Reduce the base block count slightly to avoid overcrowding
    const baseBlockCount = Math.floor((width * height) * 0.12); // 12% of cells as base (was 15%)
    const levelMultiplier = 1 + (levelNumber * 0.04); // 4% more blocks per level (was 5%)
    const targetBlockCount = Math.floor(baseBlockCount * levelMultiplier);
    
    // Keep track of placed blocks
    let placedBlocks = 0;
    
    // Function to check if a position is valid for a breakable block
    function isValidPosition(x, y) {
        // Must be within bounds
        if (x < 0 || x >= width || y < 0 || y >= height) return false;
        
        // Must be an empty space
        if (tempLayout[y][x] !== '.') return false;
        
        // Don't place blocks too close to player start
        let playerStartX = -1;
        let playerStartY = -1;
        
        // Find player position
        for (let py = 0; py < tempLayout.length; py++) {
            const px = tempLayout[py].indexOf('P');
            if (px !== -1) {
                playerStartX = px;
                playerStartY = py;
                break;
            }
        }
        
        if (playerStartX !== -1 && playerStartY !== -1) {
            if (Math.abs(x - playerStartX) + Math.abs(y - playerStartY) < 3) return false;
        }
        
        // Check if placing a block here would create an isolated area
        // Temporarily place the block
        const rowChars = tempLayout[y].split('');
        rowChars[x] = '*';
        tempLayout[y] = rowChars.join('');
        
        // Check if the grid is still navigable
        const isNavigable = checkGridNavigability(tempLayout);
        
        // Revert the change
        rowChars[x] = '.';
        tempLayout[y] = rowChars.join('');
        
        return isNavigable;
    }
    
    // Function to check if the grid is navigable (no isolated areas)
    function checkGridNavigability(layout) {
        // Find all empty spaces
        const emptySpaces = [];
        for (let y = 0; y < layout.length; y++) {
            for (let x = 0; x < layout[y].length; x++) {
                if (layout[y][x] === '.') {
                    emptySpaces.push({ x, y });
                }
            }
        }
        
        if (emptySpaces.length === 0) return true;
        
        // Use flood fill to check connectivity
        const visited = new Set();
        const start = emptySpaces[0];
        const queue = [start];
        visited.add(`${start.x},${start.y}`);
        
        while (queue.length > 0) {
            const { x, y } = queue.shift();
            
            // Check all four directions
            const directions = [
                { dx: 0, dy: -1 }, // up
                { dx: 0, dy: 1 },  // down
                { dx: -1, dy: 0 }, // left
                { dx: 1, dy: 0 }   // right
            ];
            
            for (const { dx, dy } of directions) {
                const nx = x + dx;
                const ny = y + dy;
                
                // Check if in bounds
                if (nx < 0 || nx >= layout[0].length || ny < 0 || ny >= layout.length) continue;
                
                // Check if it's an empty space and not visited
                if (layout[ny][nx] === '.' && !visited.has(`${nx},${ny}`)) {
                    visited.add(`${nx},${ny}`);
                    queue.push({ x: nx, y: ny });
                }
            }
        }
        
        // If all empty spaces are visited, the grid is navigable
        return visited.size === emptySpaces.length;
    }
    
    // Try to place breakable blocks randomly
    let attempts = 0;
    const maxAttempts = width * height * 2; // Limit attempts to avoid infinite loops
    
    while (placedBlocks < targetBlockCount && attempts < maxAttempts) {
        attempts++;
        
        // Choose a random position
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        
        if (isValidPosition(x, y)) {
            // Place a breakable block
            const rowChars = tempLayout[y].split('');
            rowChars[x] = '*';
            tempLayout[y] = rowChars.join('');
            placedBlocks++;
        }
    }
    
    // Return a new object with the updated layout, not modifying the original
    return {
        ...levelData,
        layout: tempLayout
    };
}

// Create the game level
function createLevel(level) {
    try {
        // Get THREE safely
        const THREE = getThree();
        
        // Get level data
        const levelData = levels[level - 1];
        if (!levelData) {
            console.error('Invalid level:', level);
            return;
        }
        
        // Store existing player if present
        const existingPlayer = window.player;
        
        // Clear existing objects except player
        const objectsToRemove = [];
        window.scene.traverse((object) => {
            if (object instanceof THREE.Mesh && object !== existingPlayer?.mesh) {
                objectsToRemove.push(object);
            }
        });
        
        for (const object of objectsToRemove) {
            window.scene.remove(object);
            if (object.geometry) object.geometry.dispose();
            if (Array.isArray(object.material)) {
                object.material.forEach(m => m.dispose());
            } else if (object.material) {
                object.material.dispose();
            }
        }
        
        // Clear any existing breakable blocks in the grid
        if (window.grid && window.grid.breakableBlocks) {
            window.grid.breakableBlocks = {};
        }
        
        // Create a clean copy of the level data to work with
        const workingLevelData = JSON.parse(JSON.stringify(levelData));
        
        // First, clear any existing breakable blocks from the layout
        for (let y = 0; y < workingLevelData.layout.length; y++) {
            let row = workingLevelData.layout[y];
            let newRow = '';
            for (let x = 0; x < row.length; x++) {
                if (row[x] === '*') {
                    newRow += '.'; // Replace with empty space
                } else {
                    newRow += row[x];
                }
            }
            workingLevelData.layout[y] = newRow;
        }
        
        // Generate random breakable blocks for this level
        // This must be done AFTER clearing the scene but BEFORE parsing the layout
        const updatedLevelData = generateRandomBreakableBlocks(workingLevelData);
        
        // Parse level layout with the updated level data
        parseLevelLayout(window.grid, updatedLevelData);
        
        // If player exists, ensure it's still in the grid and scene
        if (existingPlayer) {
            if (!window.scene.children.includes(existingPlayer.mesh)) {
                window.scene.add(existingPlayer.mesh);
            }
            if (!window.grid.entities.includes(existingPlayer)) {
                window.grid.addEntity(existingPlayer);
            }
        }
        
        // Add enemies based on level data
        const Enemy = window.Enemy; // Get Enemy class from window
        
        // Add additional enemies based on enemyCount
        const additionalEnemies = updatedLevelData.enemyCount - window.grid.entities.filter(e => e.constructor.name === 'Enemy').length;
        
        if (additionalEnemies > 0) {
            for (let i = 0; i < additionalEnemies; i++) {
                // Find a random empty cell
                let x, y;
                do {
                    x = Math.floor(Math.random() * (window.grid.width - 2)) + 1;
                    y = Math.floor(Math.random() * (window.grid.height - 2)) + 1;
                } while (
                    window.grid.grid[y][x] !== 0 || // Not empty
                    (x === window.grid.playerStartX && y === window.grid.playerStartY) || // Not player start
                    // Not too close to player start
                    (Math.abs(x - window.grid.playerStartX) < 3 && Math.abs(y - window.grid.playerStartY) < 3)
                );
                
                // Create enemy at this position with appropriate level
                // Use different enemy types based on level
                let enemyLevel = window.currentLevel;
                if (enemyLevel > 3) enemyLevel = 3; // Cap at level 3
                
                new Enemy(window.grid, x, y, enemyLevel);
            }
        }
        
        // Update UI
        updateLevelDisplay();
        
        // Force a render
        window.renderer.render(window.scene, window.camera);
    } catch (error) {
        console.error('Error creating level:', error);
    }
}

// Update level display in UI
function updateLevelDisplay() {
    const levelElement = document.getElementById('level');
    if (levelElement) {
        levelElement.textContent = `Level: ${window.currentLevel}`;
    }
    
    // Check if player exists before accessing its properties
    if (window.player) {
        const livesElement = document.getElementById('lives');
        const bombsElement = document.getElementById('bombs');
        
        if (livesElement) {
            livesElement.textContent = `Lives: ${window.player.lives}`;
        }
        
        if (bombsElement) {
            bombsElement.textContent = `Bombs: ${window.player.bombCount}`;
        }
    }
}

// Advance to next level
function nextLevel() {
    try {
        window.currentLevel++;
        
        // Remove level complete message
        const message = document.getElementById('levelComplete');
        if (message) {
            document.body.removeChild(message);
        }
        
        // Remove bonus message
        const bonusMessage = document.getElementById('bonusMessage');
        if (bonusMessage) {
            document.body.removeChild(bonusMessage);
        }
        
        // Create new level
        createLevel(window.currentLevel);
        
        // Fade out the overlay
        const overlay = document.getElementById('fadeOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            
            // Remove overlay after fade out
            setTimeout(() => {
                if (overlay && overlay.parentNode) {
                    document.body.removeChild(overlay);
                }
            }, 1000);
        }
        
        // Reset transition state
        window.levelTransition = false;
    } catch (error) {
        console.error('Error advancing to next level:', error);
        // Display error message to user
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Error loading next level. Please refresh the page.';
        document.body.appendChild(errorMessage);
    }
}

export { levels, parseLevelLayout, createLevel, updateLevelDisplay, nextLevel }; 
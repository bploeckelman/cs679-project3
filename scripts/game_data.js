// ----------------------------------------------------------------------------
// Game-Data
// ----------------------------------------------------------------------------
LEVEL_DETAILS = [
    // Level 0 ------------------------
	{ 	artifactPositions: [
            new THREE.Vector2(600 / 2, 600 / 2),
            new THREE.Vector2(600 / 4, 600 / 4),
            new THREE.Vector2(600 * 3 / 4, 600 * 3 / 4)
		],
		numXCells: 60,
		numYCells: 60 },
    // Level 1 ------------------------
	{ 	artifactPositions: [
            new THREE.Vector2(800 / 2, 800 / 2),
            new THREE.Vector2(800 / 4, 800 / 4),
            new THREE.Vector2(800 * 3 / 4, 800 * 3 / 4)
		],
		numXCells: 80,
		numYCells: 80 },
    // Level 2 ------------------------
	{ 	artifactPositions: [
            new THREE.Vector2(1000 / 2, 1000 / 2),
            new THREE.Vector2(1000 / 4, 1000 / 4),
            new THREE.Vector2(1000 * 3 / 4, 1000 * 3 / 4)
		],
		numXCells: 100,
		numYCells: 100 },
    // Level 3 ------------------------
	{ 	artifactPositions: [
            new THREE.Vector2(1200 / 2, 1200 / 2),
            new THREE.Vector2(1200 / 4, 1200 / 4),
            new THREE.Vector2(1200 * 3 / 4, 1200 * 3 / 4)
		],
		numXCells: 120,
		numYCells: 120 },
    // Level 4 ------------------------
	{ 	artifactPositions: [
            new THREE.Vector2(1400 / 2, 1400 / 2),
            new THREE.Vector2(1400 / 4, 1400 / 4),
            new THREE.Vector2(1400 * 3 / 4, 1400 * 3 / 4)
		],
		numXCells: 140,
		numYCells: 140 },
    // Level 5 ------------------------
	{ 	artifactPositions: [
            new THREE.Vector2(1600 / 2, 1600 / 2),
            new THREE.Vector2(1600 / 4, 1600 / 4),
            new THREE.Vector2(1600 * 3 / 4, 1600 * 3 / 4)
		],
		numXCells: 160,
		numYCells: 160 },
];

ROUND_DETAILS = [
	{ numEnemies: [5, 0, 0, 0],   health: 1.0,  size: 1.0, speed: 0.25 },
    { numEnemies: [10, 5, 0, 0],   health: 2.0,  size: 1.2, speed: 0.50 },
    { numEnemies: [10, 10, 5, 0],  health: 4.0,  size: 1.4, speed: 0.75 },
    { numEnemies: [10, 10, 10, 5],  health: 6.0,  size: 1.6, speed: 1.00 },
    { numEnemies: [10, 10, 10, 10],  health: 8.0,  size: 1.8, speed: 1.50 },
    { numEnemies: [20, 20, 20, 20],  health: 10.0, size: 2.0, speed: 2.00 },
];

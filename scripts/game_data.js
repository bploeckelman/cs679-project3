// ----------------------------------------------------------------------------
// Game-Data
// ----------------------------------------------------------------------------
LEVEL_DETAILS = [
    // Level 0 ------------------------
	{ 	artifactPositions: [
            new THREE.Vector2(600 / 2, 600 / 2),
            new THREE.Vector2(600 / 4, 600 / 4),
		],
		numXCells: 60,
		numYCells: 60 },
    // Level 1 ------------------------
	{ 	artifactPositions: [
            new THREE.Vector2(800 / 2, 800 / 2),
            new THREE.Vector2(800 / 4, 800 / 4),
            new THREE.Vector2(800 * 3 / 4, 800 * 3 / 4),
		],
		numXCells: 80,
		numYCells: 80 },
    // Level 2 ------------------------
	{ 	artifactPositions: [
            new THREE.Vector2(1000 / 2, 1000 / 2),
            new THREE.Vector2(1000 / 4, 1000 / 4),
            new THREE.Vector2(1000 * 3 / 4, 1000 * 3 / 4),
            new THREE.Vector2(1000 * 1 / 4, 1000 * 3 / 4),
		],
		numXCells: 100,
		numYCells: 100 },
    // Level 3 ------------------------
	{ 	artifactPositions: [
            new THREE.Vector2(1100 / 2, 1100 / 2),
            new THREE.Vector2(1100 / 4, 1100 / 4),
            new THREE.Vector2(1100 * 3 / 4, 1100 * 3 / 4),
            new THREE.Vector2(1100 * 1 / 4, 1100 * 3 / 4),
            new THREE.Vector2(1100 * 3 / 4, 1100 * 1 / 4),
		],
		numXCells: 110,
		numYCells: 110 },
    // Level 4 ------------------------
	{ 	artifactPositions: [
            new THREE.Vector2(1200 / 2, 1200 / 2),
            new THREE.Vector2(1200 / 4, 1200 / 4),
            new THREE.Vector2(1200 * 3 / 4, 1200 * 3 / 4),
            new THREE.Vector2(1200 * 1 / 4, 1200 * 3 / 4),
            new THREE.Vector2(1200 * 1 / 4, 1200 * 1 / 4),
		],
		numXCells: 120,
		numYCells: 120 },
    // Level 5 ------------------------
	{ 	artifactPositions: [
            new THREE.Vector2(1300 / 2, 1300 / 2),
            new THREE.Vector2(1300 / 4, 1300 / 4),
            new THREE.Vector2(1300 * 3 / 4, 1300 * 3 / 4),
            new THREE.Vector2(1300 * 1 / 4, 1300 * 3 / 4),
            new THREE.Vector2(1300 * 3 / 4, 1300 * 1 / 4),
            new THREE.Vector2(1300 * 1 / 3, 1300 * 2 / 3),
            new THREE.Vector2(1300 * 2 / 3, 1300 * 1 / 3),
		],
		numXCells: 130,
		numYCells: 130 },
];

ROUND_DETAILS = [
	{ numEnemies: [3, 1, 1, 1],  health: 1.0,  size: 1.0, speed: 0.25 },
    { numEnemies: [5, 3, 1, 1],  health: 2.0,  size: 1.2, speed: 0.50 },
    { numEnemies: [10, 5, 3, 1],  health: 4.0,  size: 1.4, speed: 0.75 },
    { numEnemies: [15, 10, 5, 3],  health: 6.0,  size: 1.6, speed: 1.00 },
    { numEnemies: [110, 15, 10, 5],  health: 8.0,  size: 1.8, speed: 1.25 },
    { numEnemies: [10, 10, 10, 10], health: 10.0, size: 2.0, speed: 1.50 },
];

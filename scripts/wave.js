// ----------------------------------------------------------------------------
// Wave object
// ----------------------------------------------------------------------------
function Wave (round, game) {

    // Public properties ------------------------------------------------------
    this.enemies = null;


    // Private variables ------------------------------------------------------
    var self = this,
    // numEnemies : number of enemies of each type
    //    (type indices: 0 brute, 1 lunatic, 2 artiphile, 3 baneling)
    // health, size, speed : propotion of the standard given in ENEENEMY_DESCRIPTIONS
    ROUND_DETAILS = [
        { numEnemies: [0, 1, 0, 0],   health: 1.0,  size: 1.0, speed: 0.25 },
//        { numEnemies: [0, 0, 1],   health: 2.0,  size: 1.2, speed: 0.50 },
//        { numEnemies: [0, 0, 10],  health: 4.0,  size: 1.4, speed: 0.75 },
//        { numEnemies: [0, 0, 16],  health: 6.0,  size: 1.6, speed: 1.00 },
//        { numEnemies: [0, 0, 20],  health: 8.0,  size: 1.8, speed: 1.50 },
//        { numEnemies: [0, 0, 24],  health: 10.0, size: 2.0, speed: 2.00 },
    ];

    // Wave methods -----------------------------------------------------------
    this.update = function () {
        for(var i = self.enemies.length - 1; i >= 0; --i) {
            var enemy = self.enemies[i];
            enemy.update();

            // Handle dead enemies
            if (enemy.health <= 0) {
                // Spawn a new particle system
                spawnParticles(
                    PARTICLES.ENEMY_DEATH,
                    enemy.position,
                    { color: enemy.color },
                    game);

                // Remove the dead enemy
                game.scene.remove(enemy.mesh);
                self.enemies.splice(i, 1);
            }
        }
    };

    // Remove all enemy meshes from scene and clear enemies array
    this.remove = function () {
        for (var i = 0; i < self.enemies.length; ++i) {
            game.scene.remove(self.enemies[i].mesh);
        }
        self.enemies = [];
    };

    // Constructor ------------------------------------------------------------
    (this.init = function (wave) {
        var roundDetails = (round < ROUND_DETAILS.length)
            ? ROUND_DETAILS[round] : ROUND_DETAILS[ROUND_DETAILS.length - 1];

        wave.enemies = [];
        for (var type in ENEMY_TYPES) {
            for(var i = 0; i < roundDetails.numEnemies[ENEMY_TYPES[type]]; ++i){
                var desc = shallowCopy(ENEMY_DESCRIPTIONS[ENEMY_TYPES[type]]);
                desc.health *= roundDetails.health;
                //desc.size   = new THREE.Vector2(desc.size * roundDetails.size, desc.size * roundDetails.size);
                desc.speed  = new THREE.Vector2(desc.speed * roundDetails.speed, desc.speed *roundDetails.speed);
                var enemy = new Enemy(desc);
                wave.enemies.push(enemy);
                game.scene.add(enemy.mesh);
            }
        }
    })(self);

} // end Wave object


// ----------------------------------------------------------------------------
// Wave object
// ----------------------------------------------------------------------------
function Wave (round, game) {

    // Public properties ------------------------------------------------------
    this.enemies = null;


    // Private variables ------------------------------------------------------
    var self = this,
        // TODO: add type field to change representation
        ROUND_DETAILS = [
            { numEnemies: 5,   health: 10,  size: 10, speed: 0.25 },
            { numEnemies: 8,   health: 20,  size: 12, speed: 0.70 },
            { numEnemies: 10,  health: 40,  size: 14, speed: 1.25 },
            { numEnemies: 16,  health: 60,  size: 16, speed: 1.75 },
            { numEnemies: 20,  health: 80,  size: 18, speed: 2.25 },
            { numEnemies: 24,  health: 100, size: 20, speed: 2.75 },
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
        for(var i = 0; i < roundDetails.numEnemies; ++i){
            var enemy = new Enemy({
                color:    new THREE.Vector3(
                                Math.random(),
                                Math.random(),
                                Math.random()),
                position: new THREE.Vector3(
                                Math.floor(Math.random() * 1000),
                                Math.floor(Math.random() * 1000), 0.1),
                size:     new THREE.Vector2(
                                roundDetails.size,
                                roundDetails.size),
                speed:    new THREE.Vector2(
                                roundDetails.speed,
                                roundDetails.speed),
                maxspeed: new THREE.Vector2(5,5),
                health:   roundDetails.health
            });

            // TODO: set targets in update?
            //enemy.setFollowTarget(game.player);
            enemy.setFollowTarget(game.level.artifact);
            wave.enemies.push(enemy);
            game.scene.add(enemy.mesh);
        }
    })(self);

} // end Wave object


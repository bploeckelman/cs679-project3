// ----------------------------------------------------------------------------
// Wave object
// ----------------------------------------------------------------------------
function Wave (numEnemies, game) {

    // Public properties ------------------------------------------------------
    this.enemies = null;


    // Private variables ------------------------------------------------------
    var self = this;

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
        wave.enemies = [];
        //for(var i = 0; i < numEnemies; ++i){
            var enemy = new Enemy(ENEMY_DESCRIPTIONS[ENEMY_TYPES.ARTIPHILE]);

            wave.enemies.push(enemy);
            game.scene.add(enemy.mesh);
        //}
        enemy = new Enemy(ENEMY_DESCRIPTIONS[ENEMY_TYPES.BRUTE]);

            wave.enemies.push(enemy);
            game.scene.add(enemy.mesh);

    })(self);

} // end Wave object


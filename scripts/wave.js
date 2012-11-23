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
        for(var i = 0; i < numEnemies; ++i){
            var enemy = new Enemy({
                color:    new THREE.Vector3(
                                Math.random(),
                                Math.random(),
                                Math.random()),
                position: new THREE.Vector3(
                                Math.floor(Math.random() * 1000),
                                Math.floor(Math.random() * 1000), 0.1),
                size:     new THREE.Vector2(
                                Math.floor(Math.random() * 40) + 10,
                                Math.floor(Math.random() * 40) + 10),
                speed:    new THREE.Vector2(
                                Math.random() * 1.5,
                                Math.random() * 1.5),
                maxspeed: new THREE.Vector2(5,5)
            });

            // TODO: set targets in update?
            enemy.setFollowTarget(game.player);
            wave.enemies.push(enemy);
            game.scene.add(enemy.mesh);
        }
    })(self);

} // end Wave object


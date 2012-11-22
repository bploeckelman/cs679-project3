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
                // Spawn a particle system
                // TODO: Make particle system spawning functions in utilities.js
                var pgeom = new THREE.Geometry();
                for (var j = 0; j < 50; ++j) { // TODO remove magic #
                    var particle = new THREE.Vector3(
                            enemy.mesh.position.x,
                            enemy.mesh.position.y,
                            enemy.mesh.position.z
                        );
                    particle.velocity = new THREE.Vector3(
                        Math.random() * 0.5 - 0.25,
                        Math.random() * 0.5 - 0.25,
                        0);
                    pgeom.vertices.push(particle);
                }

                var pmat = new THREE.ParticleBasicMaterial({
                    size: 10,
                    sizeAttenuation: true,
                    blending: THREE.NormalBlending, //AdditiveBlending,
                    color: enemy.color
                });

                // Create the explosion particle system
                var psys = new THREE.ParticleSystem(pgeom, pmat);
                psys.sortParticles = true;
                psys.complete = false;
                // Shrink the size of the particles in the system over time
                new TWEEN.Tween({ size: psys.material.size })
                    .to({ size: 0.0 }, 3000)
                    .easing(TWEEN.Easing.Circular.Out)
                    .onUpdate(function () {
                        psys.material.size = this.size;
                    })
                    .onComplete(function () {
                        psys.complete = true;
                    })
                    .start();
                game.particles.push(psys);

                game.scene.add(psys);

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


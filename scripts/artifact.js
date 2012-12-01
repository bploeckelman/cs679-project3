// ----------------------------------------------------------------------------
// Artifact object
// ----------------------------------------------------------------------------
function Artifact (level, game) {

    // Public properties ------------------------------------------------------
    this.mesh   = null;
    this.clock  = null;
    this.health = null;

    // Private variables ------------------------------------------------------
    var self = this,
        accum = 0;


    // Level methods ----------------------------------------------------------
    this.update = function () {
        if (self.health <= 0)
            return;

        var t = self.clock.getDelta();

        // Update rotation
        self.mesh.rotation.x += Math.sin(t / 1000) * 300;
        self.mesh.rotation.y += 0;
        self.mesh.rotation.z += Math.cos(t / 1000) * 300;

        // Update color based on health (goes more red as damaged)
        var green = self.health / 100;
        self.mesh.material.color.setRGB(1, green, 0);
    };


    this.die = function () {
        spawnParticles(
            // TODO: make a new particle system type for this
            PARTICLES.ENEMY_DEATH,
            self.mesh.position,
            { color: new THREE.Color(0xff0000) },
            game
        );
        game.scene.remove(self.mesh);
    };


    // Constructor ------------------------------------------------------------
    (this.init = function (artifact) {
        // Initialize the mesh
        artifact.mesh = new THREE.Mesh(
            new THREE.CubeGeometry(
                2 * level.size.cellw,
                2 * level.size.cellh,
                2 * level.size.cellh),
            new THREE.MeshLambertMaterial({ color: 0xffff00 })
        );

        artifact.mesh.position.set(
            level.size.width  / 2,
            level.size.height / 2,
            level.size.cellh  / 2 
        );

        game.scene.add(artifact.mesh);

        // Initialize the animation clock
        artifact.clock = new THREE.Clock(true);

        // Set initial health
        artifact.health = 100;

        console.log("Artifact initialized.");
    })(self);

} // end Artifact object


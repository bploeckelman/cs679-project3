// ----------------------------------------------------------------------------
// Artifact object
// ----------------------------------------------------------------------------
function Artifact (level, game) {

    // Public properties ------------------------------------------------------
    this.mesh   = null;
    this.clock  = null;
    this.health = null;
    this.pulse  = null;

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

        // TODO: these updates should be done in a takeDamage() function
        // Update color based on health (goes more red as damaged)
        var green = self.health / 100;
        self.mesh.material.color.setRGB(1, green, 0);
        // Increase pulse rate as health drops
        // TODO: switch to an easing function for calculating pulse time rate 
        self.pulse.time = 2000 * self.health / 100 + 10;
        self.pulse.tweenIn.to({ scale: self.pulse.maxScale }, self.pulse.time);
        self.pulse.tweenOut.to({ scale: self.pulse.minScale }, self.pulse.time);
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
		
		//End game
		game.gamelost = true;
    };


    // Constructor ------------------------------------------------------------
    (this.init = function (artifact) {
        // Initialize the mesh
        artifact.mesh = new THREE.Mesh(
            new THREE.CubeGeometry(
                2 * level.size.cellw,
                2 * level.size.cellh,
                2 * level.size.cellh),
            new THREE.MeshLambertMaterial({
                color: 0xffff00,
                transparent: true,
                blending: THREE.AdditiveBlending
            })
        );

        artifact.mesh.position.set(
            level.size.width  / 2,
            level.size.height / 2,
            level.size.cellh
        );

        game.scene.add(artifact.mesh);

        // Initialize the animation clock
        artifact.clock = new THREE.Clock(true);

        // Set initial health
        artifact.health = 100;

        // Setup pulse tweens
        artifact.pulse = { time: 500, minScale: 0.75, maxScale: 1.0, tweenIn: null, tweenOut: null };

        artifact.pulse.tweenIn = new TWEEN.Tween({ scale: artifact.pulse.minScale })
            .to({ scale: artifact.pulse.maxScale }, artifact.pulse.time)
            //.easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function () {
                artifact.mesh.scale.x = this.scale;
                artifact.mesh.scale.y = this.scale;
                artifact.mesh.scale.z = this.scale;
            })
            .onComplete(function () { this.scale = artifact.pulse.minScale; });

        artifact.pulse.tweenOut = new TWEEN.Tween({ scale: artifact.pulse.maxScale })
            .to({ scale: artifact.pulse.minScale }, artifact.pulse.time)
            //.easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function () {
                artifact.mesh.scale.x = this.scale;
                artifact.mesh.scale.y = this.scale;
                artifact.mesh.scale.z = this.scale;
            })
            .onComplete(function () { this.scale = artifact.pulse.maxScale; });

        artifact.pulse.tweenIn.chain(artifact.pulse.tweenOut);
        artifact.pulse.tweenOut.chain(artifact.pulse.tweenIn);
        artifact.pulse.tweenIn.start();

        console.log("Artifact initialized.");
    })(self);

} // end Artifact object


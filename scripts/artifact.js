// ----------------------------------------------------------------------------
// Artifact object
// ----------------------------------------------------------------------------
function Artifact (position, level, game) {

    // Public properties ------------------------------------------------------
    this.mesh   = null;
    this.position = null;
    this.clock  = null;
	this.origHealth = null;
    this.health = null;
	this.destroyed = null;
    this.pulse  = null;
    this.runningDamageEffect = false;
    
    this.collidable = true;
    this.boundingBox = null;
    
    this.claimed = false;
    this.justClaimed = false;
    
    // Private variables ------------------------------------------------------
    var self = this,
        accum = 0;

    // Level methods ----------------------------------------------------------
    this.update = function () {
        if (self.health <= 0 || self.destroyed)
            return;

        var t = self.clock.getDelta();

        // Update rotation
        self.mesh.rotation.x += Math.sin(t / 1000) * 300;
        self.mesh.rotation.y += 0;
        self.mesh.rotation.z += Math.cos(t / 1000) * 300;

        // TODO: these updates should be done in a takeDamage() function
        // Update color based on health (goes more red as damaged)
        var green = self.health / 100;
        self.mesh.material.color.setRGB(
                (self.claimed) ? 1.0 : 0.25,
                (self.claimed) ? green : 0.25,
                0);
        // Increase pulse rate as health drops
        // TODO: switch to an easing function for calculating pulse time rate 
        self.pulse.time = 2000 * self.health / 100 + 10;
        self.pulse.tweenIn.to({ scale: self.pulse.maxScale }, self.pulse.time);
        self.pulse.tweenOut.to({ scale: self.pulse.minScale }, self.pulse.time);
    };


    this.takeDamage = function (amount) {
        if (amount > 0) {
            if (!self.runningDamageEffect)
                            self.health = self.health - amount;
            if (self.health <= 0) {
                self.die();
            } else {
                // Run damage effect
                if (!self.runningDamageEffect) {
                    spawnParticles(
                        PARTICLES.ARTIFACT_DAMAGE,
                        self.mesh.position,
                        { color: new THREE.Color(0xf0f000) },
                        game
                    );
                    new Audio("sounds/artifact_damage.wav").play();

                    setTimeout(function () { self.runningDamageEffect = false; }, 1500);
                    self.runningDamageEffect = true;
                }
            }
        }
    };
	
	
    this.die = function () {
        spawnParticles(
            PARTICLES.ARTIFACT_DEATH,
            self.mesh.position,
            { color: new THREE.Color(0xff0000) },
            game
        );
		self.destroyed = true;
        game.scene.remove(self.mesh);
        new Audio("sounds/artifact_die.wav").play();

        //End game
		var gameLost = true;
		for (var i=0; i < game.level.artifacts.length; ++i) {
			if (!game.level.artifacts[i].destroyed &&
				game.level.artifacts[i].claimed) {
				gameLost = false;
				break;
			}
		}
		if (gameLost)
			game.gamelost = true;
    };

    /*
     * Checks to see if this object collides with the passed object
     */
    this.collidesWith = function (object) {
        if (this.collidable) {
            return self.boundingBox.intersects(other.boundingBox);
        }
        else {
            return false;
        }
    };
    
     this.handleCollision = function (object) {
        if (object instanceof Enemy) {
            self.takeDamage(object.artifactDamage);
        }
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
        artifact.mesh.position.set(position.x, position.y, level.size.cellh);
        artifact.position = artifact.mesh.position;
                
        artifact.boundingBox = new Rect(
                artifact.position.x + 10 - (level.size.cellw * 4) / 2,
                artifact.position.y + 10 - (level.size.cellh * 4) / 2,
                artifact.position.x - 15 + (level.size.cellw * 4) / 2,
                artifact.position.y - 15 + (level.size.cellh * 4) / 2
            );


        game.scene.add(artifact.mesh);

        // Initialize the animation clock
        artifact.clock = new THREE.Clock(true);

        // Set initial health
        artifact.health = 100;
		artifact.origHealth = 100;
		artifact.destroyed = false;

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


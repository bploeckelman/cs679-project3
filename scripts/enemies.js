// ----------------------------------------------------------------------------
// Enemy object
// ----------------------------------------------------------------------------
function Enemy (description) {

    // Public properties ------------------------------------------------------
    this.mesh     = null;
    this.position = null;
    this.velocity = null;
    this.size     = null;
    this.speed    = null;
    this.maxspeed = null;
    this.target   = null;
	//used by box2D


    // Private variables ------------------------------------------------------
    var self = this;


    // Player methods ---------------------------------------------------------
    this.update = function () {
        // Follow the target
        if (self.target !== null) {
            // Velocity is a vector to the target in the xy plane
           // self.velocity.x = self.target.position.x - self.position.x;
		   self.velocity.x = self.target.getPosition().x - self.position.x;
         //   self.velocity.y = self.target.position.y - self.position.y;
		  self.velocity.y = self.target.getPosition().y - self.position.y;
            self.velocity.z = 0;

            // Normalize the velocity 
            var d = Math.sqrt(self.velocity.x * self.velocity.x
                            + self.velocity.y * self.velocity.y);
            if (d < 0.1) d = 1;

            // Update the enemy's velocity
            self.velocity.x *= self.speed.x / d;
            self.velocity.y *= self.speed.y / d;
        }

        // Integrate velocity
        self.position.addSelf(self.velocity);
    };


    this.setFollowTarget = function (object) {
        if (object instanceof Player) {
            self.target = object;
        }
    };


    // Constructor ------------------------------------------------------------
    (this.init = function (enemy, description) {

        enemy.position = new THREE.Vector3(0,0,0.1);
        enemy.velocity = new THREE.Vector2(0,0);

        // Initialize properties from description object
        for(var prop in description) {
            if (prop === "color") {
                if (description[prop] instanceof THREE.Vector3) {
                    var rgb = description[prop].clone();
                    enemy.color = new THREE.Color(0x000000);
                    enemy.color.setRGB(rgb.x, rgb.y, rgb.z);
                }
            } else if (prop === "position") {
                if (description[prop] instanceof THREE.Vector3) {
                    enemy.position = description[prop].clone();
                }
            } else if (prop === "size") {
                if (description[prop] instanceof THREE.Vector2) {
                    enemy.size = description[prop].clone();
                }
            } else if (prop === "speed") {
                if (description[prop] instanceof THREE.Vector2) {
                    enemy.speed = description[prop].clone();
                }
            } else if (prop === "maxspeed") {
                if (description[prop] instanceof THREE.Vector2) {
                    enemy.maxspeed = description[prop].clone();
                }
            }
        }

        // Generate a simple plane mesh for now
        // TODO: pass an enemy type value in the description object
        //       and pick from predefined geometry based on that 
        enemy.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(enemy.size.x, enemy.size.y),
            new THREE.MeshBasicMaterial({
                color: enemy.color.getHex(),
                wireframe: true
            })
        );
        enemy.mesh.position = enemy.position;

        // Create "breathing" animation
        var BREATHE_TIME = 150 * Math.max(enemy.size.x, enemy.size.y),
            MAX_SCALE = 1.35,
            MIN_SCALE = 0.65,
            breatheIn = new TWEEN.Tween({ scale: MIN_SCALE })
                .to({ scale: MAX_SCALE }, BREATHE_TIME)
                .easing(TWEEN.Easing.Cubic.InOut)
                .onUpdate(function () {
                    enemy.mesh.scale.x = this.scale;
                    enemy.mesh.scale.y = this.scale;
                })
                .onComplete(function () { this.scale = MIN_SCALE; }),
            breatheOut = new TWEEN.Tween({ scale: MAX_SCALE })
                .to({ scale: MIN_SCALE }, BREATHE_TIME)
                .easing(TWEEN.Easing.Cubic.InOut)
                .onUpdate(function () {
                    enemy.mesh.scale.x = this.scale;
                    enemy.mesh.scale.y = this.scale;
                })
                .onComplete(function () { this.scale = MAX_SCALE; });

        breatheIn.chain(breatheOut);
        breatheOut.chain(breatheIn);
        breatheIn.start();

        console.log("Enemy initialized.");
    })(self, description);

} // end Enemy object


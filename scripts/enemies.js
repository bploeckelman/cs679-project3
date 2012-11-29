// Cylinder: topRadius, bottomRadius, height, radiusSegments, heightSegments
var PYRAMID = new THREE.CylinderGeometry(0, 10, 10, 4, 1),
    TRIANGLE = (function initializeTriangleGeometry () {
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(-5, -5, 0.2));
        geometry.vertices.push(new THREE.Vector3( 5, -5, 0.2));
        geometry.vertices.push(new THREE.Vector3( 0,  5, 0.2));
        geometry.faces.push(new THREE.Face3(0, 1, 2));
        return geometry;
    }) ();
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
    this.health   = null;
    this.intersects = null;


    // Private variables ------------------------------------------------------
    var self = this;


    // Player methods ---------------------------------------------------------
    this.update = function () {
        // Follow the target
        if (self.target !== null) {
            // Velocity is a vector to the target in the xy plane
            self.velocity.x = self.target.mesh.position.x - self.position.x;
            self.velocity.y = self.target.mesh.position.y - self.position.y;
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
        if (!self.intersects) {
            self.position.addSelf(self.velocity);

            // Rotate towards target
            self.mesh.rotation.z = Math.atan2(
                self.target.mesh.position.y - self.mesh.position.y,
                self.target.mesh.position.x - self.mesh.position.x);
        }

    };


    this.setFollowTarget = function (object) {
        self.target = object;
    };


    this.takeDamage = function (amount) { 
        if ((self.health = self.health - amount) <= 0) {
            self.die();
        } else {
            // TODO: handle non-lethal damage
        }
    };


    this.die = function () {
        // TODO: add any special handling for enemy death here
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
            } else if (prop === "health") {
                if (!isNaN(description[prop])) {
                    enemy.health = description[prop];
                } else {
                    enemy.health = 100;
                }
            }
        }

        // Generate a mesh for the enemy
        // TODO: pass an enemy type value in the description object
        //       and pick from predefined geometry based on that 
        enemy.mesh = new THREE.Mesh(
            // PYRAMID, // Note: 3d geometry requires rotation/translation
            TRIANGLE,
            new THREE.MeshBasicMaterial({
                color: enemy.color.getHex(),
                //wireframe: true
            })
        );
        enemy.mesh.position = enemy.position;

        enemy.intersects = false;

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


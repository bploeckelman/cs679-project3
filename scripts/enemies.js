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
// Enemy Types & their Description
// ----------------------------------------------------------------------------
var ENEMY_TYPES = {
	BRUTE : 0,
	LUNATIC : 1,
};
/*
 * Possible description elements :
 * type, color, position, size, speed, maxspeed, health
 */
var ENEMY_DESCRIPTIONS= [
	{
        type: ENEMY_TYPES.BRUTE,
    },
    {
        type: ENEMY_TYPES.LUNATIC,
        maxspeed: new THREE.Vector2(20,20)
    }
];

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
	this.type     = null;

    // Private variables ------------------------------------------------------
    var self = this;


    // Enemy methods ---------------------------------------------------------
    this.update = function () {
        // Follow the target
        if (self.target !== null) {
            // Velocity is a vector to the target in the xy plane
            self.velocity.x = self.target.position.x - self.position.x;
            self.velocity.y = self.target.position.y - self.position.y;
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
                self.target.position.y - self.mesh.position.y,
                self.target.position.x - self.mesh.position.x);
        }

    };


    this.setFollowTarget = function (object) {
        if (object instanceof Player) {
            self.target = object;
        }
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

        // Initialize properties from description object if available else 
        // assign randomly
		if ("color" in description && description["color"] instanceof THREE.Vector3) {
        	var rgb = description["color"].clone();
            enemy.color = new THREE.Color(0x000000);
            enemy.color.setRGB(rgb.x, rgb.y, rgb.z);       
        } else {
        	enemy.color = new THREE.Color(0x000000);
        	enemy.color.setRGB(Math.random(), Math.random(), Math.random());
        }
        
		if ("position" in description && description["position"] instanceof THREE.Vector3) {
        	enemy.position = description["position"].clone();      
        } else {
        	enemy.position = new THREE.Vector3(Math.floor(Math.random() * 1000),
                        Math.floor(Math.random() * 1000), 0.1);
        }
        
        if ("size" in description && description["size"] instanceof THREE.Vector2) {
        	enemy.size = description["size"].clone();       
        } else {
        	enemy.size = new THREE.Vector2( Math.floor(Math.random() * 40) + 10,
                        Math.floor(Math.random() * 40) + 10);
        }
        
        if ("speed" in description && description["speed"] instanceof THREE.Vector2) {
        	enemy.speed = description["speed"].clone();        
        } else {
        	enemy.speed = new THREE.Vector2( Math.random() * 1.5, Math.random() * 1.5);
        }
        
        if ("maxspeed" in description && description["maxspeed"] instanceof THREE.Vector2) {
        	enemy.maxspeed = description["maxspeed"].clone();        
        }else {
        	enemy.maxspeed = new THREE.Vector2(5,5);	
        }
        if ("health" in description) {
        	enemy.health = description["health"];
        } else {
        	enemy.health = 100;
        }
        if ("type" in description) {
        	enemy.type = description["type"];
        } else {
        	enemy.type = ENEMY_TYPES.BRUTE;
        }
        
        // Generate a mesh for the enemy
        // TODO: pass an enemy type value in the description object
        //       and pick from predefined geometry based on that 
        enemy.mesh = new THREE.Mesh(
            // PYRAMID, // Note: 3d geometry requires rotation/translation
            TRIANGLE,
            new THREE.MeshBasicMaterial({
                color: enemy.color.getHex(),
                wireframe: true
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
        console.log(enemy);
    })(self, description);

} // end Enemy object


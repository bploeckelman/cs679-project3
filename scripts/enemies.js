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
	ARTIPHILE : 2,
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
    },
    {
        type: ENEMY_TYPES.ARTIPHILE,
    },
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
	this.structDamage = 0.02;
	this.playerDamage = 0.1;
	this.vision = 100;

	this.path = null;
	this.EPSILON = 4;
	
	
    // Private variables ------------------------------------------------------
    var self = this;


    // Enemy methods ---------------------------------------------------------
    this.update = function () {
    	
    	switch(self.type) {
        case ENEMY_TYPES.BRUTE :
            self.setFollowTarget(game.player);
            break;
        case ENEMY_TYPES.LUNATIC :
            if (game.frames % 60 == 0 || !self.target) {
                self.target = new THREE.Vector2(
                    Math.floor(Math.random() * 1000),
                    Math.floor(Math.random() * 1000));
            }
            break;
        case ENEMY_TYPES.ARTIPHILE :
			//self.setFollowTarget(game.level.artifact.mesh.position);
			if ( self.path == null ) {
				self.setPathToTake(self.findPathTo(game.level.artifact.mesh.position));
			}
			else {
				self.progressAlongPath();
			}
            break;
			var range = {
				x1: Math.max(0,from.x-self.vision),
				x2: Math.min(level.size.xcells, from.x+self.vision),
				y1: Math.max(0,from.y-self.vision),
				y2: Math.min(level.size.xcells, from.y+self.vision),
			}; 
        }
    	
        // Follow the target
        if (self.target !== null) {
            // Velocity is a vector to the target in the xy plane
            self.velocity.x = self.target.x - self.position.x;
            self.velocity.y = self.target.y - self.position.y;
            self.velocity.z = 0;

            // Normalize the velocity 
            var d = Math.sqrt(self.velocity.x * self.velocity.x
                            + self.velocity.y * self.velocity.y);
            if (d < 0.1) d = 1;

            // Update the enemy's velocity
            self.velocity.x *= self.speed.x / d;
            self.velocity.y *= self.speed.y / d;
        } else {
        	self.target = new THREE.Vector2(
                Math.floor(Math.random() * 1000),
                Math.floor(Math.random() * 1000));
        }

        // Integrate velocity
        if (!self.intersects) {
            self.position.addSelf(self.velocity);

            // Rotate towards target
            self.mesh.rotation.z = Math.atan2(
                self.target.y - self.mesh.position.y,
                self.target.x - self.mesh.position.x);
        }
		
		//Check structure collisions
		this.checkStructCollisions();
    };

	this.checkStructCollisions = function() {
		var enemyMin = new THREE.Vector2(
            self.position.x - 9 / 2,
            self.position.y - 9 / 2),
        enemyMax = new THREE.Vector2(
            self.position.x + 9 / 2,
            self.position.y + 9 / 2);
			
		for (var i = 0; i < game.level.structures.length; i++) {
			var struct = game.level.structures[i];

			if (enemyMin.x > struct.positionMax.x
			 || enemyMax.x < struct.positionMin.x
			 || enemyMin.y > struct.positionMax.y
			 || enemyMax.y < struct.positionMin.y) {
				continue;				
			} else {
				struct.takeDamage(self.structDamage, i);
			}
		}
		
		var pos = self.position.toGridCoords();
		console.log(pos);
		if (game.level.grid[pos.y][pos.x] == 1) {
			self.intersects = true;
		}
		else {
			self.intersects = false;
		}
	};
	
	this.setPathToTake = function (path) {
		if (path != null && path.length >= 1) {
			//path.reverse();
			self.path = path;
			//console.log(path);
		}
		//console.log(path);
		
	};

	this.progressAlongPath = function () {
		if (self.path == null) {
			self.target = null;
			return;
		}
		else if (self.target == null) {
			self.path.shift();
			self.target = new THREE.Vector2(self.path[0][0], self.path[0][1]).toRealCoords();
			self.path.shift();
			//console.log(self.path[0]);
		}
		else if (self.path.length == 0) {
			//console.log(self.path[0]);
		}
		else {
			var now = self.position;
			var target = self.target;
			//console.log(target);
			if ( Math.abs(target.x - now.x) < self.EPSILON && Math.abs(target.y - now.y) < self.EPSILON ) {
				var next = new THREE.Vector2(self.path[0][0], self.path[0][1]).toRealCoords();
				self.path.shift();
				//console.log(target);
				//console.log(now);
				self.target = next;
			}
		}
		//console.log(self.path.length);
	};
	
	this.findPathTo = function (object) {
        var level = game.level;		
        var from = self.position.toGridCoords();
        var to = object.toGridCoords();
		
		
        var grid = new PF.Grid(level.size.xcells, level.size.ycells, level.grid);
        var finder = new PF.AStarFinder();
        
        if ( from == null || to == null ) {
            self.target = null;
        } else {
            var path = finder.findPath(from.x, from.y, to.x, to.y, grid);

            if (path.length > 1 ) { 
                path = PF.Util.smoothenPath(grid, path);
                return path;
            }
			else {
				path.push([from.x, from.y]);
				path.push([to.x, to.y]);
				//console.log(path);
				return path
			}
            
        }
    };
	
	
    this.setFollowTarget = function (object) {
        var level = game.level;		
        var from = self.position.toGridCoords();
        var to = object.toGridCoords();
		
		
        var grid = new PF.Grid(level.size.xcells, level.size.ycells, level.grid);
        var finder = new PF.AStarFinder();
        
        if ( from == null || to == null ) {
            self.target = null;
        } else {
            var path = finder.findPath(from.x, from.y, to.x, to.y, grid);

            if (path.length > 1 ) { 
                path = PF.Util.smoothenPath(grid, path);
                self.target = new THREE.Vector2(path[1][0], path[1][1]).toRealCoords();
            }
            //console.log(path, self.target);
        }
    };


    this.takeDamage = function (amount) {
		self.health = self.health - amount;
        if (self.health <= 0) {
            self.die();
        } else {
            //TODO: Add damage effect?
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
		if ("vision" in description) {
        	enemy.vision = description["vision"];
        } else {
        	enemy.vision = 100;
        }
        
		//Do specific initial things based on the type of enemy
		switch(self.type) {
			case ENEMY_TYPES.BRUTE :
				break;
			case ENEMY_TYPES.LUNATIC :
				self.target = new THREE.Vector2(
				Math.floor(Math.random() * 1000),
				Math.floor(Math.random() * 1000));
				break;
			case ENEMY_TYPES.ARTIPHILE :
				//self.setFollowTarget(game.level.artifact.mesh.position);
				self.setPathToTake(self.findPathTo(game.level.artifact.mesh.position));
				break;
		};
		
        // Generate a mesh for the enemy
        // TODO: pass an enemy type value in the description object
        //       and pick from predefined geometry based on that 
        enemy.mesh = new THREE.Mesh(
            // PYRAMID, // Note: 3d geometry requires rotation/translation
            TRIANGLE,
            new THREE.MeshBasicMaterial({
                color: enemy.color.getHex()
            })
        );
        enemy.mesh.position = enemy.position;

        enemy.intersects = false;

        // Create "breathing" animation
        var BREATHE_TIME = 150 * Math.max(enemy.size.x, enemy.size.y),
            MAX_SCALE = 1.1,
            MIN_SCALE = 0.9,
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

